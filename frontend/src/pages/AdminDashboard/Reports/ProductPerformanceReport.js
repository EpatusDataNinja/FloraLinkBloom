import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Table, Spinner, Row, Col, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { reportService } from '../../../services/reportService';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../../../styles/ReportCommon.css';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { FaFilePdf } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProductPerformanceReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    categoryId: 'all'
  });
  const reportRef = useRef();
  const [forecastData, setForecastData] = useState(null);
  const [showForecast, setShowForecast] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState({});
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const pdfRef = useRef(null);

  // Move formatCurrency to component level
  const formatCurrency = (value) => {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    return typeof number === 'number' && !isNaN(number) ? number.toFixed(2) : '0.00';
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/categories`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      }
    };

    fetchCategories();
  }, []);

  const fetchRealtimeMetrics = async (productIds) => {
    if (!productIds?.length) return;

    try {
      const response = await reportService.getRealtimeMetrics(productIds);
      console.log('Realtime metrics response:', response);

      if (response?.success && response.data) {
        const metricsData = {};
        
        // Process each product's metrics
        response.data.forEach(metric => {
          if (metric?.productId) {
            metricsData[metric.productId] = {
              totalOrders: parseInt(metric.totalOrders) || 0,
              totalQuantitySold: parseInt(metric.totalQuantitySold) || 0,
              totalRevenue: parseFloat(metric.totalRevenue) || 0,
              currentStock: parseInt(metric.currentStock) || 0,
              lastStockUpdate: metric.lastUpdate || new Date().toISOString(),
              orderTrend: metric.orderTrend,
              recentOrders: metric.recentOrders || []
            };
          }
        });

        setRealtimeMetrics(metricsData);
      }
    } catch (error) {
      console.error('Error fetching realtime metrics:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setIsReportGenerated(false);
    try {
      if (!validateDates()) {
        toast.error('Start date must be before or equal to end date');
        return;
      }

      const queryParams = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        categoryId: filters.categoryId !== 'all' ? filters.categoryId : undefined
      };

      console.log('Fetching product performance with filters:', queryParams);
      const response = await reportService.getProductPerformance(queryParams);
      console.log('Product performance response:', response);

      if (response?.success && response.data) {
        const { products, summary } = response.data;
        
        // Filter products to only include "In Stock" status
        const approvedProducts = products.filter(product => 
          product.status?.toLowerCase() === 'in stock'
        );

        setReportData({
          products: products.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category?.name || 'Uncategorized',
            seller: product.user ? `${product.user.firstname} ${product.user.lastname}` : 'Unknown',
            totalOrders: parseInt(product.totalOrders) || 0,
            totalQuantitySold: parseInt(product.totalQuantitySold) || 0,
            totalRevenue: parseFloat(product.totalRevenue) || 0,
            currentStock: parseInt(product.currentStock) || 0,
            lastStockUpdate: product.lastStockUpdate,
            status: product.status
          })),
          summary: {
            // Update totalProducts to only count approved products
            totalProducts: approvedProducts.length,
            totalRevenue: parseFloat(summary.totalRevenue) || 0,
            totalOrders: parseInt(summary.totalOrders) || 0,
            completedOrders: parseInt(summary.completedOrders) || 0,
            totalQuantitySold: parseInt(summary.totalQuantitySold) || 0,
            averageOrderValue: summary.totalRevenue && summary.totalOrders ? 
              (parseFloat(summary.totalRevenue) / parseInt(summary.totalOrders)).toFixed(2) : '0.00'
          }
        });
        setIsReportGenerated(true);
        toast.success('Report generated successfully');

        // Fetch realtime metrics if we have products
        if (products.length > 0) {
          await fetchRealtimeMetrics(products.map(p => p.id));
        }
      } else {
        toast.error(response.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const validateDates = () => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    return start <= end;
  };

  const generateForecast = async (productId) => {
    try {
      setLoading(true);
      const response = await reportService.getInventoryForecast(productId);
      
      if (response?.success && response.data) {
        const forecast = {
          ...response.data,
          predictions: response.data.predictions.map(pred => ({
            ...pred,
            predictedSales: parseInt(pred.predictedSales),
            recommendedStock: parseInt(pred.recommendedStock),
            confidenceLevel: parseInt(pred.confidenceLevel)
          }))
        };
        
        setSelectedForecast(forecast);
        setShowForecast(true);
      } else {
        toast.error('Failed to generate forecast');
      }
    } catch (error) {
      console.error('Error generating forecast:', error);
      toast.error(error.message || 'Failed to generate forecast');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate growth
  const calculateGrowth = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(2);
  };

  const handleShowForecast = (forecastData) => {
    setSelectedForecast(forecastData);
    setShowForecast(true);
  };

  const ForecastModal = ({ show, onHide, forecast }) => (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Product Forecast</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {forecast && (
          <div>
            <h5>Forecast Details</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Predicted Sales</th>
                  <th>Confidence Level</th>
                  <th>Recommended Stock</th>
                </tr>
              </thead>
              <tbody>
                {forecast.predictions.map((prediction, index) => (
                  <tr key={index}>
                    <td>{prediction.period}</td>
                    <td>{prediction.predictedSales}</td>
                    <td>{prediction.confidenceLevel}%</td>
                    <td>{prediction.recommendedStock}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            <div className="mt-3">
              <h6>Recommendations</h6>
              <ul>
                {forecast.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Update chart data preparation
  const chartData = reportData?.products ? {
    labels: reportData.products.map(product => product?.name || 'Unknown'),
    datasets: [
      {
        label: 'Revenue ($)',
        data: reportData.products.map(product => Number(product?.totalRevenue) || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Units Sold',
        data: reportData.products.map(product => Number(product?.totalQuantitySold) || 0),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Product Performance Overview'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Units Sold'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  // Update renderProductRow to use the component-level formatCurrency
  const renderProductRow = (product) => {
    if (!product) return null;
    
    const getStatusBadgeColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'in stock':
          return 'success';
        case 'out of stock':
          return 'danger';
        case 'pending approval':
          return 'warning';
        default:
          return 'secondary';
      }
    };
    
    return (
      <tr key={product.id}>
        <td>{product.name}</td>
        <td>{product.category}</td>
        <td>{product.seller}</td>
        <td>
          <div className="d-flex flex-column">
            <span>{product.totalOrders}</span>
            <small className={`text-${product.totalOrders > 0 ? 'success' : 'warning'}`}>
              {product.totalOrders > 0 ? 'Active' : 'No Orders'}
            </small>
          </div>
        </td>
        <td>{product.totalQuantitySold}</td>
        <td>${formatCurrency(product.totalRevenue)}</td>
        <td>
          <div className="d-flex flex-column">
            <span>{product.currentStock}</span>
            <span className={`badge bg-${getStatusBadgeColor(product.status)}`}>
              {product.status}
            </span>
          </div>
        </td>
        <td>
          <Button 
            size="sm" 
            variant="info"
            onClick={() => generateForecast(product.id)}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Forecast'}
          </Button>
        </td>
      </tr>
    );
  };

  // Add PDF generation function
  const handleGeneratePDF = async () => {
    if (!reportData) return;

    setLoading(true);
    try {
      const content = pdfRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );

      pdf.save(`Product_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="product-performance-report">
        <Card className="mb-4">
          <Card.Body>
            <h2 className="mb-4">Product Performance Report</h2>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    max={filters.endDate}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    min={filters.startDate}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={filters.categoryId}
                    onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Button 
              onClick={generateReport} 
              disabled={loading}
              className="generate-report-btn"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </Card.Body>
        </Card>

        {isReportGenerated && reportData ? (
          <>
            {/* Add PDF button */}
            <div className="d-flex justify-content-end mb-3">
              <Button
                variant="secondary"
                onClick={handleGeneratePDF}
                disabled={loading}
                className="d-flex align-items-center gap-2"
              >
                <FaFilePdf /> Save as PDF
              </Button>
            </div>

            {/* Wrap report content in ref for PDF generation */}
            <div ref={pdfRef}>
              {/* Summary Section */}
              <Card className="mb-4">
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <h6>Total Products</h6>
                      <h4>{reportData.summary.totalProducts}</h4>
                    </Col>
                    <Col md={3}>
                      <h6>Total Revenue</h6>
                      <h4>${formatCurrency(reportData.summary.totalRevenue)}</h4>
                    </Col>
                    <Col md={3}>
                      <h6>Total Orders</h6>
                      <h4>{reportData.summary.totalOrders}</h4>
                      {reportData.summary.completedOrders > 0 && (
                        <small className="text-success">
                          {reportData.summary.completedOrders} completed
                        </small>
                      )}
                    </Col>
                    <Col md={3}>
                      <h6>Average Order Value</h6>
                      <h4>${formatCurrency(reportData.summary.averageOrderValue)}</h4>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Chart Section */}
              <Card className="mb-4">
                <Card.Body>
                  {chartData && (
                    <div className="chart-container" style={{ height: '400px' }}>
                      <Bar data={chartData} options={chartOptions} />
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Products Table */}
              <Card>
                <Card.Body>
                  <h4>Detailed Product Performance</h4>
                  <div className="table-responsive">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Seller</th>
                          <th>Total Orders</th>
                          <th>Units Sold</th>
                          <th>Revenue</th>
                          <th>Current Stock</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.products.length > 0 ? (
                          reportData.products.map(product => renderProductRow(product))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">No products found</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </>
        ) : isReportGenerated ? (
          <Card className="mb-4">
            <Card.Body>
              <p className="text-center">No data available for the selected criteria.</p>
            </Card.Body>
          </Card>
        ) : null}

        <ForecastModal 
          show={showForecast}
          onHide={() => setShowForecast(false)}
          forecast={selectedForecast}
        />
      </div>
    </ErrorBoundary>
  );
};

export default ProductPerformanceReport;