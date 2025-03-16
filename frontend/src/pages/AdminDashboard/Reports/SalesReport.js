import React, { useState, useRef } from 'react';
import { Card, Button, Table, Form, Row, Col, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { reportService } from '../../../services/reportService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaFilePdf } from 'react-icons/fa';

// Update PrintableContent to handle undefined or non-array reportData
const PrintableContent = React.forwardRef(({ reportData, filters = {} }, ref) => {
  // Ensure we have the correct data structure
  const orders = reportData?.data?.orders || [];
  const summary = reportData?.data?.summary || {};

  // Helper function to safely convert to number and format
  const formatCurrency = (value) => {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    return typeof number === 'number' && !isNaN(number) ? number.toFixed(2) : '0.00';
  };

  return (
    <div ref={ref} className="print-content">
      <div className="report-header mb-4">
        <h3>Sales Report</h3>
        <p>Period: {filters.startDate || 'N/A'} to {filters.endDate || 'N/A'}</p>
        <p>Status: {filters.status || 'All'}</p>
      </div>

      {/* Summary Section */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <h6>Total Orders</h6>
              <h4>{summary.totalOrders || 0}</h4>
            </Col>
            <Col md={3}>
              <h6>Total Revenue</h6>
              <h4>${formatCurrency(summary.totalRevenue)}</h4>
            </Col>
            <Col md={3}>
              <h6>Average Order Value</h6>
              <h4>${formatCurrency(summary.averageOrderValue)}</h4>
            </Col>
            <Col md={3}>
              <h6>Completed Orders</h6>
              <h4>{summary.completedOrders || 0}</h4>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{`${order.buyer?.firstname || ''} ${order.buyer?.lastname || ''}`}</td>
                      <td>{order.product?.name || 'N/A'}</td>
                      <td>{order.quantity || 0}</td>
                      <td>${formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span className={`badge bg-${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">No orders found</td>
                  </tr>
                )}
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

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'danger';
    case 'shipped':
      return 'info';
    default:
      return 'secondary';
  }
};

PrintableContent.displayName = 'PrintableContent';

const SalesReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all',
    limit: 10,
    offset: 0
  });
  const pdfRef = useRef(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await reportService.getSalesReport(filters);
      console.log('API Response:', response);

      if (response.success) {
        setReportData(response);
        toast.success('Report generated successfully');
      } else {
        toast.error(response.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate report');
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

      pdf.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const validateDates = () => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    return start <= end;
  };

  const handleGenerateClick = () => {
    if (!validateDates()) {
      toast.error('Start date must be before or equal to end date');
      return;
    }
    generateReport();
  };

  console.log('SalesReport rendering with data:', { reportData, filters });

  return (
    <div className="sales-report">
      <Card className="mb-4">
        <Card.Body>
          <h2 className="mb-4">Sales Report</h2>
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
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Button onClick={handleGenerateClick} disabled={loading}>
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

        <Card>
          <Card.Body>
            <PrintableContent 
                ref={pdfRef}
              reportData={reportData} 
              filters={filters} 
            />
          </Card.Body>
        </Card>
        </>
      )}
    </div>
  );
};

export default SalesReport;