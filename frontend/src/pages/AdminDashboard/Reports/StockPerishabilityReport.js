import React, { useState, useRef } from 'react';
import { Card, Form, Button, Table, Row, Col, Badge, Alert, Spinner as BootstrapSpinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ReactToPrint from 'react-to-print';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { reportService } from '../../../services/reportService';
import '../../../styles/ReportCommon.css';

// Register ALL required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

// Risk Distribution Chart Component
const RiskDistributionChart = ({ data }) => {
  if (!data) return null;

  const chartData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [{
      data: [
        data.highRisk || 0,
        data.mediumRisk || 0,
        data.lowRisk || 0
      ],
      backgroundColor: ['#dc3545', '#ffc107', '#198754'],
      borderColor: ['#dc3545', '#ffc107', '#198754'],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Stock Risk Distribution'
      }
    }
  };

  try {
    return (
      <div style={{ height: '300px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
    );
  } catch (error) {
    console.error('Error rendering chart:', error);
    return <Alert variant="danger">Failed to render chart</Alert>;
  }
};

// Main Stock Perishability Report Component
const StockPerishabilityReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [threshold, setThreshold] = useState(10);
  const reportRef = useRef();

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await reportService.getStockReport(threshold);
      if (response.success) {
        setReportData(response.data);
        toast.success('Report generated successfully');
      } else {
        toast.error(response.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk) => {
    const colors = {
      High: 'danger',
      Medium: 'warning',
      Low: 'success'
    };
    return <Badge bg={colors[risk] || 'secondary'}>{risk}</Badge>;
  };

  return (
    <div className="report-container">
      <h2 className="mb-4">Stock & Perishability Report</h2>
      
      <Card className="report-filters">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Stock Threshold (Days)</Form.Label>
                <Form.Control
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value) || 10)}
                  min="1"
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <div className="d-flex gap-2">
                <Button onClick={generateReport} disabled={loading}>
                  {loading ? (
                    <>
                      <BootstrapSpinner 
                        as="span"
                        animation="border" 
                        size="sm" 
                        role="status"
                        aria-hidden="true"
                      />
                      {' '}Generating...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
                {reportData && (
                  <ReactToPrint
                    trigger={() => <Button variant="secondary">Print Report</Button>}
                    content={() => reportRef.current}
                  />
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {reportData && (
        <div ref={reportRef} className="report-content">
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h4>Risk Distribution</h4>
                  {reportData.summary && (
                    <RiskDistributionChart 
                      data={reportData.summary}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h4>Summary</h4>
                  <ul className="list-unstyled">
                    <li>High Risk Items: {reportData.summary?.highRisk || 0}</li>
                    <li>Medium Risk Items: {reportData.summary?.mediumRisk || 0}</li>
                    <li>Low Risk Items: {reportData.summary?.lowRisk || 0}</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Body>
              <h4>Stock Details</h4>
              <div className="table-responsive">
                <Table striped bordered hover className="report-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Avg. Daily Sales</th>
                      <th>Days Until Stockout</th>
                      <th>Risk Level</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.stockMetrics?.map((product, index) => (
                      <tr key={index}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.currentStock}</td>
                        <td>{product.avgDailySales}</td>
                        <td>{product.daysUntilStockout || 'N/A'}</td>
                        <td>{getRiskBadge(product.perishabilityRisk)}</td>
                        <td>{new Date(product.lastUpdated).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StockPerishabilityReport;