import React, { useState, useRef } from 'react';
import { Card, Form, Button, Table, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { reportService } from '../../../services/reportService';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaFilePdf } from 'react-icons/fa';
import '../../../styles/ReportCommon.css';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Add ErrorBoundary component
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
      return <Alert variant="danger">Error rendering chart</Alert>;
    }
    return this.props.children;
  }
}

// Update the PrintableContent component to use ErrorBoundary
const PrintableContent = React.forwardRef(({ reportData, filters }, ref) => {
  if (!reportData) return null;

  const RiskDistributionChart = ({ data }) => {
    if (!data || (!data.highRisk && !data.mediumRisk && !data.lowRisk)) {
      return <Alert variant="info">No risk distribution data available</Alert>;
    }

    const chartData = {
      labels: ['High Risk', 'Medium Risk', 'Low Risk'],
      datasets: [{
        data: [data.highRisk || 0, data.mediumRisk || 0, data.lowRisk || 0],
        backgroundColor: ['#dc3545', '#ffc107', '#198754'],
        borderColor: ['#dc3545', '#ffc107', '#198754'],
        borderWidth: 1
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        title: {
          display: true,
          text: 'Stock Risk Distribution'
        }
      }
    };

    return (
      <ChartErrorBoundary>
        <div style={{ height: '300px', width: '100%' }}>
          <Doughnut data={chartData} options={options} />
        </div>
      </ChartErrorBoundary>
    );
  };

  return (
    <div ref={ref} className="print-content">
      <div className="report-header mb-4">
        <h3>Stock Perishability Report</h3>
        <p>Risk Threshold: {filters.threshold} days</p>
      </div>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className={`bg-danger bg-opacity-10 border-danger`}>
            <Card.Body>
              <h6 className="text-muted">High Risk Items</h6>
              <h3 className="text-danger">{reportData.highRiskCount}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className={`bg-warning bg-opacity-10 border-warning`}>
            <Card.Body>
              <h6 className="text-muted">Medium Risk Items</h6>
              <h3 className="text-warning">{reportData.mediumRiskCount}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className={`bg-success bg-opacity-10 border-success`}>
            <Card.Body>
              <h6 className="text-muted">Low Risk Items</h6>
              <h3 className="text-success">{reportData.lowRiskCount}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Risk Distribution Chart */}
      <Card className="mb-4">
        <Card.Body>
          <RiskDistributionChart data={reportData.riskDistribution} />
        </Card.Body>
      </Card>

      {/* Items Table */}
      {reportData.items && reportData.items.length > 0 && (
        <Card>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Days Until Stockout</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {reportData.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.currentStock}</td>
                    <td>{item.daysUntilStockout}</td>
                    <td>
                      <Badge bg={
                        item.riskLevel === 'High' ? 'danger' :
                        item.riskLevel === 'Medium' ? 'warning' : 'success'
                      }>
                        {item.riskLevel}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <div className="report-footer mt-4">
        <p>Generated on: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
});

PrintableContent.displayName = 'PrintableContent';

const StockPerishabilityReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    threshold: 10 // Set default value
  });
  const [error, setError] = useState(null);
  const pdfRef = useRef(null);

  // Simplified generateReport function
  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure threshold is a number
      const threshold = parseInt(filters.threshold);
      if (isNaN(threshold) || threshold < 1) {
        throw new Error('Please enter a valid threshold value (minimum 1 day)');
      }

      console.log('Generating stock report with threshold:', threshold);
      const response = await reportService.getStockReport(threshold);
      
      console.log('Stock report response:', response);

      if (response?.success && response.data) {
        setReportData(response.data);
        toast.success('Report generated successfully');
      } else {
        throw new Error(response?.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate report';
      setError(errorMessage);
      toast.error(errorMessage);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
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

      pdf.save(`Stock_Perishability_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
      <h2 className="mb-4">Stock Perishability Report</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Form className="mb-0">
            <Row>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Risk Threshold (days)</Form.Label>
                  <Form.Control
                    type="number"
                    value={filters.threshold}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFilters({ 
                        ...filters, 
                        threshold: isNaN(value) ? '' : Math.max(1, value)
                      });
                    }}
                    min="1"
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter the number of days to consider for stock risk assessment
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Button 
                  variant="primary" 
                  onClick={generateReport}
                  disabled={loading || !filters.threshold || filters.threshold < 1}
                  className="w-100"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Generating Report...
                    </>
                  ) : 'Generate Report'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
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

          <PrintableContent 
            ref={pdfRef}
            reportData={reportData}
            filters={filters}
          />
        </>
      )}

      {!reportData && !loading && !error && (
        <Card>
          <Card.Body className="text-center">
            <p>No data available. Please generate a report.</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default StockPerishabilityReport;