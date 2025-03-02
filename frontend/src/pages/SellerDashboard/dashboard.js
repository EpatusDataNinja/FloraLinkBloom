import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Badge } from 'react-bootstrap';
import { FaBox, FaShoppingCart, FaDollarSign } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Title from "../../components_part/TitleCard";
// Register chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);
const TOKEN =  localStorage.getItem("token");

const SellerOverview = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/seller/overview`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${TOKEN}`
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data);
      }
    };

    fetchData();
  }, []);

  if (!stats) {
    return <div>Loading...</div>;
  }

  // Data for Pie charts
  const productChartData = {
    labels: ['In Stock', 'Out of Stock', 'Rejected'],
    datasets: [{
      data: [stats.productStats['In Stock'], stats.productStats['Out of Stock'], stats.productStats.rejected],
      backgroundColor: ['#4caf50', '#f44336', '#ff9800'], // Green, Red, Orange
      borderWidth: 1,
    }],
  };

  const orderChartData = {
    labels: ['Paid', 'Shipped', 'Delivered', 'Completed'],
    datasets: [{
      data: [stats.orderStats.paid, stats.orderStats.shipped || 0, stats.orderStats.delivered || 0, stats.orderStats.completed],
      backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#f44336'], // Green, Orange, Blue, Red
      borderWidth: 1,
    }],
  };

  // Helper function to render dynamic order status
  const renderOrderStatus = (status) => {
    switch (status) {
      case 'paid':
        return <Badge bg="success">Paid</Badge>;
      case 'shipped':
        return <Badge bg="warning">Shipped</Badge>;
      case 'delivered':
        return <Badge bg="info">Delivered</Badge>;
      case 'completed':
        return <Badge bg="primary">Completed</Badge>;
      default:
        return <Badge bg="secondary">Pending</Badge>;
    }
  };

  // Helper function to render dynamic product status
  const renderProductStatus = (status) => {
    switch (status) {
      case 'In Stock':
        return <Badge bg="success">In Stock</Badge>;
      case 'Out of Stock':
        return <Badge bg="danger">Out of Stock</Badge>;
      case 'Rejected':
        return <Badge bg="warning">Rejected</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mt-4">
  
      <Title title={'Overview '}/>

      {/* Cards Section */}
      <Row className="mb-4 g-4"> {/* g-4 to add gutter spacing between columns */}
        {/* Products Statistics Card */}
        <Col xs={12} md={6} lg={4}>
          <Card className="text-white" style={{ backgroundColor: '#4caf50' }}>
            <Card.Body>
              <Card.Title><FaBox size={32} color="white" /> Products</Card.Title>
              <Card.Text>
                <strong>Total Products:</strong> {stats.productStats.totalProducts}
              </Card.Text>
              <Card.Text>
                <strong>In Stock:</strong> {stats.productStats['In Stock']} {renderProductStatus('In Stock')}
              </Card.Text>
              <Card.Text>
                <strong>Out of Stock:</strong> {stats.productStats['Out of Stock']} {renderProductStatus('Out of Stock')}
              </Card.Text>
              <Card.Text>
                <strong>Rejected:</strong> {stats.productStats.rejected} {renderProductStatus('Rejected')}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Orders Statistics Card */}
        <Col xs={12} md={6} lg={4}>
          <Card className="text-white" style={{ backgroundColor: '#ff9800' }}>
            <Card.Body>
              <Card.Title><FaShoppingCart size={32} color="white" /> Orders</Card.Title>
              <Card.Text>
                <strong>Total Orders:</strong> {stats.orderStats.totalOrders}
              </Card.Text>
              <Card.Text>
                <strong>Completed:</strong> {stats.orderStats.completed} {renderOrderStatus('completed')}
              </Card.Text>
              <Card.Text>
                <strong>Paid:</strong> {stats.orderStats.paid} {renderOrderStatus('paid')}
              </Card.Text>
              <Card.Text>
                <strong>Shipped:</strong> {stats.orderStats.shipped} {renderOrderStatus('shipped')}
              </Card.Text>
              <Card.Text>
                <strong>Delivered:</strong> {stats.orderStats.delivered} {renderOrderStatus('delivered')}
              </Card.Text>
              <Card.Text>
                <strong>Total Revenue:</strong> ${stats.orderStats.totalRevenue}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Profit Card */}
        <Col xs={12} md={6} lg={4}>
          <Card className="text-white" style={{ backgroundColor: '#9c27b0' }}>
            <Card.Body>
              <Card.Title><FaDollarSign size={32} color="white" /> Total Profit</Card.Title>
              <Card.Text>
                <strong>Profit:</strong> ${stats.totalProfit}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Graphs Section */}
      <Row className="mb-4 g-4">
        {/* Products Chart */}
        <Col xs={12} md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Product Breakdown</Card.Title>
              <Pie data={productChartData} />
            </Card.Body>
          </Card>
        </Col>

        {/* Orders Chart */}
        <Col xs={12} md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Order Breakdown</Card.Title>
              <Pie data={orderChartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SellerOverview;
