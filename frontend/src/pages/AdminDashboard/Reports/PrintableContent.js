import React from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';

// Remove forwardRef temporarily to debug
const PrintableContent = React.forwardRef(({ reportData }, ref) => {
  const { data, summary, filters } = reportData || {};

  if (!data || data.length === 0) {
    return null;
  }

  const chartData = {
    labels: data.map(user => user.name || 'Unknown'),
    datasets: [
      {
        label: 'Orders Placed',
        data: data.map(user => user.ordersPlaced || 0),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Products Listed',
        data: data.map(user => user.productsListed || 0),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'User Activity Overview'
      }
    },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <div ref={ref} className="printable-report">
      <div className="report-header">
        <h3>User Activity Report</h3>
        <p>Period: {filters.startDate} to {filters.endDate}</p>
        {filters.userRole !== 'all' && <p>Role: {filters.userRole}</p>}
      </div>

      {summary && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body>
                <h6>Total Users</h6>
                <h4>{summary.totalUsers}</h4>
              </Card.Body>
            </Card>
          </Col>
          {/* ... other summary cards ... */}
        </Row>
      )}

      <div className="chart-container" style={{ height: '400px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>

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
          {data.map((user, index) => (
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

      <div className="report-footer">
        <p>Generated on: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
});

PrintableContent.displayName = 'PrintableContent';

export default PrintableContent; 