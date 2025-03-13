import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Table, Spinner, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { reportService } from '../../../services/reportService';
import '../../../styles/ReportCommon.css';
import { FaPrint, FaFilePdf } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register ChartJS components before using them
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Create a PrintableComponent
const PrintableComponent = React.forwardRef((props, ref) => {
  const { reportData, reportSummary, filters, chartData, chartOptions } = props;
  
  // Filter data to only show approved products in summary
  const approvedProductsCount = reportData.reduce((sum, user) => 
    sum + (user.productsListed || 0), 0);

  return (
    <div ref={ref} className="print-content">
      <div className="report-header mb-4">
        <h3>User Activity Report</h3>
        <p>Period: {filters.startDate} to {filters.endDate}</p>
        {filters.userRole !== 'all' && <p>Role: {filters.userRole}</p>}
      </div>

      {reportSummary && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body>
                <h6>Total Users</h6>
                <h4>{reportSummary.totalUsers}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body>
                <h6>Approved Products</h6>
                <h4>{approvedProductsCount}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body>
                <h6>Total Orders</h6>
                <h4>{reportSummary.totalOrders}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body>
                <h6>Total Spent</h6>
                <h4>${reportSummary.totalSpent.toFixed(2)}</h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Card className="mb-4">
        <Card.Body>
          <h4>Activity Overview</h4>
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h4>Detailed User Activity</h4>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Role</th>
                  <th>Registration Date</th>
                  <th>Orders Placed</th>
                  <th>Products Listed</th>
                  <th>Total Spent</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((user, index) => (
                  <tr key={user.id || index}>
                    <td>{user.name || 'N/A'}</td>
                    <td>{user.role || 'N/A'}</td>
                    <td>{user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{user.ordersPlaced || 0}</td>
                    <td>{user.productsListed || 0}</td>
                    <td>${(user.totalSpent || 0).toFixed(2)}</td>
                    <td>{user.lastActive ? new Date(user.lastActive).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <div className="report-footer mt-4">
        <p>Generated on: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
});

PrintableComponent.displayName = 'PrintableComponent';

const UserActivityReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    userRole: 'all',
    userId: 'all'
  });
  const [users, setUsers] = useState([]);
  const printRef = useRef(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/v1/users`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      console.log('Generating report with filters:', filters);
      const response = await reportService.getUserActivity(filters);
      console.log('User activity response:', response);

      if (response.success) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setReportData(response.data);
        toast.success('Report generated successfully');
        } else {
          setReportData([]);
          toast.info('No data found for the selected criteria');
        }
      } else {
        toast.error(response.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.message || 'Failed to generate report');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: reportData.map(user => user.name || 'Unknown'),
    datasets: [
      {
        label: 'Orders Placed',
        data: reportData.map(user => user.ordersPlaced || 0),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Products Listed',
        data: reportData.map(user => user.productsListed || 0),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Activity Overview'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Comment out the print handler
  /*
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `User_Activity_Report_${new Date().toISOString().split('T')[0]}`,
    copyStyles: true,
    removeAfterPrint: true,
    onBeforeGetContent: () => {
      setLoading(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setLoading(false);
      toast.success('Report printed successfully');
    },
    onPrintError: (error) => {
      console.error('Print failed:', error);
      toast.error('Failed to print report');
      setLoading(false);
    }
  });
  */

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const content = pdfRef.current;
      const canvas = await html2canvas(content, {
        scale: 2, // Increased scale for better quality
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

      // Calculate dimensions
      const imgWidth = 210; // A4 width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image with better quality
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

      pdf.save(`User_Activity_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  // Update the PrintButtons component to only show PDF button
  const PrintButtons = () => (
    <div className="d-flex gap-2">
      {/* Comment out the print button
      <Button 
        variant="primary" 
        onClick={handlePrint}
        disabled={loading}
        className="d-flex align-items-center gap-2"
      >
        <FaPrint /> Print Report
      </Button>
      */}
      <Button 
        variant="secondary" 
        onClick={handleGeneratePDF}
        disabled={loading}
        className="d-flex align-items-center gap-2"
      >
        <FaFilePdf /> Save as PDF
      </Button>
    </div>
  );

  const reportSummary = React.useMemo(() => {
    if (!reportData.length) return null;

    return {
      totalUsers: reportData.length,
      totalOrders: reportData.reduce((sum, user) => sum + (user.ordersPlaced || 0), 0),
      totalProducts: reportData.reduce((sum, user) => sum + (user.productsListed || 0), 0),
      totalSpent: reportData.reduce((sum, user) => sum + (user.totalSpent || 0), 0),
    };
  }, [reportData]);

  return (
    <div className="report-container">
      <h2 className="mb-4">User Activity Report</h2>
      
      <Card className="report-filters mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>User Role</Form.Label>
                <Form.Select
                  value={filters.userRole}
                  onChange={(e) => setFilters({...filters, userRole: e.target.value})}
                >
                  <option value="all">All Roles</option>
                  <option value="buyer">Buyers</option>
                  <option value="seller">Sellers</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>User</Form.Label>
                <Form.Select
                  value={filters.userId}
                  onChange={(e) => setFilters({...filters, userId: e.target.value})}
                >
                  <option value="all">All Users</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstname} {user.lastname}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="mt-3 d-flex justify-content-between align-items-center">
            <Button 
              onClick={generateReport} 
              disabled={loading}
              className="d-flex align-items-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
            {reportData.length > 0 && <PrintButtons />}
          </div>
        </Card.Body>
      </Card>

      {reportData.length > 0 ? (
        <>
          <div className="mb-3 no-print">
            <h4>Report Preview</h4>
              </div>
          
          {/* Print version */}
          <div style={{ display: 'none' }}>
            <PrintableComponent
              ref={printRef}
              reportData={reportData}
              reportSummary={reportSummary}
              filters={filters}
              chartData={chartData}
              chartOptions={chartOptions}
            />
          </div>

          {/* Display version */}
          <PrintableComponent
            ref={pdfRef}
            reportData={reportData}
            reportSummary={reportSummary}
            filters={filters}
            chartData={chartData}
            chartOptions={chartOptions}
          />
        </>
      ) : (
          <Card>
          <Card.Body className="text-center">
            {loading ? (
              <div>
                <Spinner animation="border" />
                <p className="mt-2">Generating report...</p>
              </div>
            ) : (
              <p>No data available for the selected criteria. Please generate a report.</p>
            )}
            </Card.Body>
          </Card>
      )}
    </div>
  );
};

export default UserActivityReport;