import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Spinner, Row, Col, Table, Tab, Tabs, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ReactToPrint from 'react-to-print';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { reportService } from '../../../services/reportService';
import '../../../styles/ReportCommon.css';
import { FaFilePdf } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Error boundary component
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="alert alert-danger">Error rendering chart</div>;
    }
    return this.props.children;
  }
}

const SalesChart = ({ data, year }) => {
  const noSalesData = data.monthlyData.every(month => month.totalSales === 0);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
      label: 'Monthly Sales (RWF)',
      data: data.monthlyData.map(month => month.totalSales),
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 5,
        pointHoverRadius: 7,
        yAxisID: 'y'
      },
      {
        label: 'Order Count',
        data: data.monthlyData.map(month => month.orderCount),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Sales Trends for ${year}`,
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.datasetIndex === 0) {
              return `Revenue: RWF ${context.parsed.y.toLocaleString()}`;
            }
            return `Orders: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (RWF)'
        },
        ticks: {
          callback: (value) => `RWF ${value.toLocaleString()}`
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Order Count'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div>
      <div style={{ height: '400px', width: '100%' }}>
        <Line data={chartData} options={options} />
      </div>
      
      {noSalesData && (
        <div className="alert alert-info mt-3">
          <i className="fas fa-info-circle me-2"></i>
          No sales data available for {year}
        </div>
      )}
    </div>
  );
};

const analyzePeakSeasons = (data) => {
  // Rwanda's seasons
  const seasons = [
    {
      name: 'Long Rainy (Mar-May)',
      defaultFlowers: ['Roses', 'Lilies', 'Chrysanthemums'],
      typicalRevenue: 2500000 // in RWF
    },
    {
      name: 'Long Dry (Jun-Aug)',
      defaultFlowers: ['Sunflowers', 'Protea', 'Local Wildflowers'],
      typicalRevenue: 3000000
    },
    {
      name: 'Short Rainy (Sep-Nov)',
      defaultFlowers: ['Orchids', 'Anthurium', 'Bird of Paradise'],
      typicalRevenue: 2000000
    },
    {
      name: 'Short Dry (Dec-Feb)',
      defaultFlowers: ['Roses', 'Mixed Bouquets', 'Wedding Flowers'],
      typicalRevenue: 3500000
    }
  ];

  const hasData = data.monthlyData.some(month => month.totalSales > 0);

  return seasons.map(season => ({
    name: season.name,
    topFlowers: season.defaultFlowers,
    revenue: hasData ? 0 : season.typicalRevenue,
    growth: 'N/A - Future Year',
    note: hasData ? 'Based on actual sales' : 'Based on historical patterns'
  }));
};

const analyzeProductTrends = (data) => {
  // Default product categories for floriculture
  const defaultProducts = [
    {
      name: 'Premium Roses',
      bestSeason: 'Winter/Valentine\'s',
      avgPrice: 49.99,
      demandTrend: 'Typically Strong',
      qualityRetention: '7-10 days'
    },
    {
      name: 'Mixed Bouquets',
      bestSeason: 'All Seasons',
      avgPrice: 39.99,
      demandTrend: 'Steady',
      qualityRetention: '5-7 days'
    },
    {
      name: 'Seasonal Arrangements',
      bestSeason: 'Varies',
      avgPrice: 59.99,
      demandTrend: 'Season Dependent',
      qualityRetention: '7-14 days'
    }
  ];

  const hasData = data.monthlyData.some(month => 
    Object.keys(month.products || {}).length > 0
  );

  return hasData ? 
    [] : // If we have actual data, process it (currently empty)
    defaultProducts.map(product => ({
      ...product,
      note: 'Projected data for future planning'
    }));
};

const analyzeWeatherImpact = (data) => {
  const isFutureYear = parseInt(data.year) > new Date().getFullYear();

  return [
    {
      condition: 'High Temperature (>30°C)',
      impact: isFutureYear ? 'Historical: Moderate Decrease' : 'Moderate Decrease',
      affectedProducts: ['Roses', 'Tulips', 'Daisies'],
      recommendation: 'Plan for additional cooling capacity'
    },
    {
      condition: 'High Humidity (>70%)',
      impact: isFutureYear ? 'Historical: Significant Impact' : 'Significant Impact',
      affectedProducts: ['Orchids', 'Lilies'],
      recommendation: 'Ensure dehumidification systems are maintained'
    },
    {
      condition: 'Optimal Conditions (20-25°C)',
      impact: isFutureYear ? 'Historical: Peak Performance' : 'Peak Performance',
      affectedProducts: ['All Varieties'],
      recommendation: 'Standard storage conditions adequate'
    }
  ].map(item => ({
    ...item,
    note: isFutureYear ? 'Based on historical patterns' : undefined
  }));
};

const calculateInventoryOptimization = (data) => {
  const isFutureYear = parseInt(data.year) > new Date().getFullYear();
  
  return [
    {
      category: 'Premium Roses',
      recommendedStock: '150-200 stems',
      peakSeason: 'Valentine\'s Day, Mother\'s Day',
      storageRequirements: '2-8°C',
      shelfLife: '7-10 days',
      specialNotes: 'Increase stock by 50% during peak seasons'
    },
    {
      category: 'Mixed Bouquets',
      recommendedStock: '75-100 arrangements',
      peakSeason: 'Year-round, higher during holidays',
      storageRequirements: '4-6°C',
      shelfLife: '5-7 days',
      specialNotes: 'Rotate stock every 3 days'
    },
    {
      category: 'Tropical Flowers',
      recommendedStock: '50-75 stems',
      peakSeason: 'Summer Events',
      storageRequirements: '13-18°C',
      shelfLife: '10-14 days',
      specialNotes: 'Monitor humidity levels closely'
    }
  ].map(item => ({
    ...item,
    note: isFutureYear ? 'Projected requirements based on historical data' : undefined
  }));
};

const calculateYearOverYearComparison = (currentData, previousData) => {
  if (!previousData) return null;
  
  const currentTotal = currentData.monthlyData.reduce((sum, month) => sum + month.totalSales, 0);
  const previousTotal = previousData.monthlyData.reduce((sum, month) => sum + month.totalSales, 0);
  
  return {
    percentageChange: previousTotal ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0,
    absoluteChange: currentTotal - previousTotal
  };
};

const YearComparisonCard = ({ currentYear, previousYear }) => {
  if (!previousYear) return null;
  
  const comparison = calculateYearOverYearComparison(currentYear, previousYear);
  
  return (
    <Card className="mb-4">
      <Card.Body>
        <h4 className="border-bottom pb-2">Year-over-Year Comparison</h4>
        <Row>
          <Col md={6}>
            <div className={`alert ${comparison.percentageChange >= 0 ? 'alert-success' : 'alert-warning'}`}>
              <h5>Growth Rate</h5>
              <p className="mb-0">
                <i className={`fas fa-${comparison.percentageChange >= 0 ? 'arrow-up' : 'arrow-down'} me-2`}></i>
                {comparison.percentageChange.toFixed(2)}%
              </p>
            </div>
          </Col>
          <Col md={6}>
            <div className="alert alert-info">
              <h5>Absolute Change</h5>
              <p className="mb-0">
                RWF {Math.abs(comparison.absoluteChange).toLocaleString()}
                {comparison.absoluteChange >= 0 ? ' increase' : ' decrease'}
              </p>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

const SeasonalAnalysisTable = ({ seasonalMetrics, selectedSeason }) => {
  const formatCurrency = (value) => {
    return typeof value === 'number' ? value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'RWF'
    }) : 'RWF 0.00';
  };

  // Filter metrics based on selected season
  const filteredMetrics = selectedSeason === 'all' 
    ? seasonalMetrics 
    : {
        [selectedSeason]: seasonalMetrics[selectedSeason] || {
          totalSales: 0,
          orderCount: 0,
          averageOrderValue: 0,
          topProducts: [],
          topCategories: []
        }
      };

  return (
    <>
      <div className="mb-3">
        <h5>Analysis for: {selectedSeason === 'all' 
          ? 'All Seasons' 
          : RWANDA_SEASONS[selectedSeason]?.label || selectedSeason}
        </h5>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Season</th>
            <th>Total Sales</th>
            <th>Orders</th>
            <th>Avg. Order Value</th>
            <th>Top Products</th>
            <th>Top Categories</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(filteredMetrics).map(([season, data]) => (
            <tr key={season}>
              <td className="text-capitalize">
                {RWANDA_SEASONS[season]?.label || season}
              </td>
              <td>{formatCurrency(data.totalSales)}</td>
              <td>{data.orderCount}</td>
              <td>{formatCurrency(data.averageOrderValue)}</td>
              <td>
                {data.topProducts && data.topProducts.length > 0 ? (
                  <ul className="list-unstyled mb-0">
                    {data.topProducts.slice(0, 3).map((product, index) => (
                      <li key={index}>
                        {product.name} ({formatCurrency(product.revenue)})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted">No products data</span>
                )}
              </td>
              <td>
                {data.topCategories && data.topCategories.length > 0 ? (
                  <ul className="list-unstyled mb-0">
                    {data.topCategories.slice(0, 3).map((category, index) => (
                      <li key={index}>
                        {category.name} ({formatCurrency(category.revenue)})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted">No categories data</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {Object.keys(filteredMetrics).length === 0 && (
        <Alert variant="info">
          No data available for the selected season
        </Alert>
      )}
    </>
  );
};

const RWANDA_SEASONS = {
  'Long Rainy': { months: [2, 3, 4], label: 'Long Rainy (Mar-May)' },
  'Long Dry': { months: [5, 6, 7], label: 'Long Dry (Jun-Aug)' },
  'Short Rainy': { months: [8, 9, 10], label: 'Short Rainy (Sep-Nov)' },
  'Short Dry': { months: [11, 0, 1], label: 'Short Dry (Dec-Feb)' }
};

// Move getSeasonalBreakdown outside of components
const getSeasonalBreakdown = (data, selectedSeason = 'all') => {
  if (!data) return {};
  
  const seasonalData = {};
  const seasonsToProcess = selectedSeason === 'all' 
    ? Object.keys(RWANDA_SEASONS)
    : [selectedSeason];

  seasonsToProcess.forEach(season => {
    const { months } = RWANDA_SEASONS[season];
    const seasonMonths = data.monthlyData.filter((_, index) => months.includes(index));
    
    seasonalData[season] = {
      totalSales: seasonMonths.reduce((sum, month) => sum + month.totalSales, 0),
      orderCount: seasonMonths.reduce((sum, month) => sum + month.orderCount, 0),
      products: seasonMonths.reduce((acc, month) => {
        Object.entries(month.products || {}).forEach(([id, product]) => {
          if (!acc[id]) acc[id] = { ...product, quantity: 0, revenue: 0 };
          acc[id].quantity += product.quantity;
          acc[id].revenue += product.revenue;
        });
        return acc;
      }, {})
    };
  });
  
  return seasonalData;
};

const SeasonalTrendsReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [previousYearData, setPreviousYearData] = useState(null);
  const [seasonalMetrics, setSeasonalMetrics] = useState({
    peakSeasons: [],
    productTrends: [],
    weatherImpact: [],
    inventoryOptimization: []
  });
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const reportRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const isFutureYear = selectedYear > currentYear;

  const generateReport = async () => {
    // Validate season selection
    if (!selectedSeason) {
      toast.error('Please select a season first');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [currentYearResponse, previousYearResponse] = await Promise.all([
        reportService.getSeasonalReport(selectedYear, selectedSeason),
        reportService.getSeasonalReport(selectedYear - 1, selectedSeason)
      ]);

      if (currentYearResponse.success && currentYearResponse.data) {
        setReportData(currentYearResponse.data);
        setPreviousYearData(previousYearResponse.success ? previousYearResponse.data : null);
        processSeasonalMetrics(currentYearResponse.data);
        toast.success('Report generated successfully');
      } else {
        throw new Error(currentYearResponse.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error.message);
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const processSeasonalMetrics = (data) => {
    const seasonalData = getSeasonalBreakdown(data, selectedSeason);
    const metrics = {};
    
    Object.entries(seasonalData).forEach(([season, data]) => {
      const totalSales = data.totalSales || 0;
      const orderCount = data.orderCount || 0;
      
      // Process products data with their actual categories
      const products = Object.values(data.products || {}).map(product => ({
        name: product.name || 'Unnamed Product',
        revenue: product.revenue || 0,
        quantity: product.quantity || 0,
        // Get category from the product's category object
        category: product.category?.name || (product.categoryName) || 'Flowers' // Default to 'Flowers' instead of 'Other'
      }));

      // Sort products by revenue
      const topProducts = products
        .sort((a, b) => b.revenue - a.revenue)
        .map(product => ({
          name: product.name,
          revenue: product.revenue,
          quantity: product.quantity
        }));

      // Group products by category with proper category names
      const categories = products.reduce((acc, product) => {
        const categoryName = product.category;
        if (!acc[categoryName]) {
          acc[categoryName] = {
            name: categoryName,
            revenue: 0,
            quantity: 0
          };
        }
        acc[categoryName].revenue += product.revenue;
        acc[categoryName].quantity += product.quantity;
        return acc;
      }, {});

      // Sort categories by revenue and ensure proper naming
      const topCategories = Object.values(categories)
        .sort((a, b) => b.revenue - a.revenue)
        .map(category => ({
          name: category.name,
          revenue: category.revenue,
          quantity: category.quantity
        }))
        .filter(category => category.name !== 'Other'); // Filter out 'Other' category if present

      metrics[season] = {
        totalSales,
        orderCount,
        averageOrderValue: orderCount > 0 ? totalSales / orderCount : 0,
        topProducts,
        topCategories
      };
    });

    setSeasonalMetrics(metrics);
  };

  const handleGeneratePDF = async () => {
    if (!reportData) return;

    setLoading(true);
    try {
      const content = reportRef.current;
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

      pdf.save(`Seasonal_Trends_Report_${selectedYear}_${selectedSeason}.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <h2 className="mb-4">Seasonal Trends Analysis</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Year</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  min="2000"
                  max={new Date().getFullYear()}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Season *</Form.Label>
                <Form.Select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  isInvalid={!selectedSeason}
                >
                  <option value="">Select a season</option>
                  <option value="all">All Seasons</option>
                  {Object.entries(RWANDA_SEASONS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Form.Select>
                {!selectedSeason && (
                  <Form.Text className="text-danger">
                    Please select a season to generate the report
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            <Col xs={12} className="mt-3">
              <Button 
                variant="primary"
                onClick={generateReport} 
                disabled={loading || !selectedSeason}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" /> Generating...
                  </>
                ) : (
                  'Generate Report'
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {!reportData && !loading && (
        <Card>
          <Card.Body className="text-center">
            <p>Please select a season and generate the report to view the analysis.</p>
          </Card.Body>
        </Card>
      )}

      {reportData && (
        <>
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

          <div ref={reportRef}>
            <Card className="mb-4">
              <Card.Body>
                <h4 className="border-bottom pb-2">Seasonal Overview</h4>
                <Row>
                  <Col md={3}>
                    <div className="stat-card">
                      <h6>Total Revenue</h6>
                      <h3>RWF {selectedSeason === 'all' 
                        ? reportData.summary.totalSales.toLocaleString()
                        : Object.values(getSeasonalBreakdown(reportData, selectedSeason))
                            .reduce((sum, season) => sum + season.totalSales, 0)
                            .toLocaleString()
                      }</h3>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="stat-card">
                      <h6>Total Orders</h6>
                      <h3>{selectedSeason === 'all'
                        ? reportData.summary.totalOrders
                        : Object.values(getSeasonalBreakdown(reportData, selectedSeason))
                            .reduce((sum, season) => sum + season.orderCount, 0)
                      }</h3>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="stat-card">
                      <h6>Average Order Value</h6>
                      <h3>RWF {(() => {
                        if (selectedSeason === 'all') {
                          return reportData.summary.averageOrderValue.toLocaleString();
                        } else {
                          const seasonData = getSeasonalBreakdown(reportData, selectedSeason);
                          const totalSales = Object.values(seasonData)
                            .reduce((sum, season) => sum + season.totalSales, 0);
                          const totalOrders = Object.values(seasonData)
                            .reduce((sum, season) => sum + season.orderCount, 0);
                          return totalOrders > 0 
                            ? (totalSales / totalOrders).toLocaleString()
                            : '0';
                        }
                      })()}</h3>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="stat-card">
                      <h6>Peak Season</h6>
                      <h3>{selectedSeason === 'all'
                        ? Object.entries(getSeasonalBreakdown(reportData))
                            .sort((a, b) => b[1].totalSales - a[1].totalSales)[0]?.[0] || 'N/A'
                        : RWANDA_SEASONS[selectedSeason]?.label || selectedSeason
                      }</h3>
                  </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
            >
              <Tab eventKey="overview" title="Sales Trends">
                <Card>
                  <Card.Body>
                    <ChartErrorBoundary>
                      <SalesChart data={reportData} year={selectedYear} />
                    </ChartErrorBoundary>
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="seasonal" title="Seasonal Analysis">
                <Card>
                  <Card.Body>
                    <SeasonalAnalysisTable 
                      seasonalMetrics={seasonalMetrics}
                      selectedSeason={selectedSeason}
                    />
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="market" title="Market Insights">
                <Card>
                  <Card.Body>
                    <MarketInsightsSection 
                      data={reportData}
                      selectedSeason={selectedSeason}
                    />
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

const MarketInsightsSection = ({ data, selectedSeason }) => {
  const allSeasonalData = getSeasonalBreakdown(data);
  
  // Filter data based on selected season
  const filteredData = selectedSeason === 'all' 
    ? allSeasonalData 
    : { [selectedSeason]: allSeasonalData[selectedSeason] };

  // Prepare data for Revenue Bar Chart
  const revenueChartData = {
    labels: Object.entries(filteredData).map(([season, _]) => RWANDA_SEASONS[season]?.label || season),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(filteredData).map(season => season.totalSales),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  // Prepare data for Orders Pie Chart
  const ordersPieData = {
    labels: Object.entries(filteredData).map(([season, _]) => RWANDA_SEASONS[season]?.label || season),
    datasets: [
      {
        data: Object.values(filteredData).map(season => season.orderCount),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="market-insights">
      <Row className="mb-4">
        <Col md={12}>
          <Card className="chart-card">
            <Card.Body>
              <h5 className="text-center mb-4">Revenue Distribution by Season</h5>
              <div className="chart-container">
                <Bar
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                        callbacks: {
                          label: (context) => `Revenue: RWF ${context.raw.toLocaleString()}`
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0,0,0,0.05)'
                        },
                        ticks: {
                          callback: (value) => `RWF ${value.toLocaleString()}`
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="chart-card">
            <Card.Body>
              <h5 className="text-center mb-4">Order Distribution</h5>
              <div className="chart-container-small">
                <Pie
                  data={ordersPieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                          pointStyle: 'circle'
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        callbacks: {
                          label: (context) => `Orders: ${context.raw}`
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="seasonal-metrics-card">
            <Card.Body>
              <h5 className="text-center mb-4">Seasonal Performance</h5>
              <div className="seasonal-metrics-grid">
                {Object.entries(filteredData).map(([season, data]) => (
                  <div key={season} className="seasonal-metric-item">
                    <div className="metric-header">
                      <h6>{RWANDA_SEASONS[season]?.label || season}</h6>
                      <span className={`status-badge ${data.totalSales > 0 ? 'active' : 'inactive'}`}>
                        {data.totalSales > 0 ? 'Active' : 'No Data'}
                      </span>
                    </div>
                    <div className="metric-body">
                      <div className="metric-value-item">
                        <i className="fas fa-chart-line"></i>
                        <div>
                          <span className="label">Revenue</span>
                          <span className="value">RWF {data.totalSales.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="metric-value-item">
                        <i className="fas fa-shopping-cart"></i>
                        <div>
                          <span className="label">Orders</span>
                          <span className="value">{data.orderCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SeasonalTrendsReport;