import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Badge } from 'react-bootstrap';
import { FaBox, FaShoppingCart, FaDollarSign } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Title from "../../components_part/TitleCard";
// Register chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const SellerOverview = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/seller/overview`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch seller overview');
        }

        const data = await response.json();
        if (data.success) {
          setStats(data);
        } else {
          throw new Error(data.message || 'Failed to fetch seller overview');
        }
      } catch (error) {
        console.error('Error fetching seller overview:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!stats) {
    return <div>No data available</div>;
  }

  // Data for Pie charts
  const productChartData = {
    labels: ['In Stock', 'Out of Stock', 'Rejected'],
    datasets: [{
      data: [
        stats.productStats['In Stock'] || 0,
        stats.productStats['Out of Stock'] || 0,
        stats.productStats.rejected || 0
      ],
      backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
      borderWidth: 1,
    }],
  };

  const orderChartData = {
    labels: ['Paid', 'Shipped', 'Delivered', 'Completed'],
    datasets: [{
      data: [
        stats.orderStats.paid || 0,
        stats.orderStats.shipped || 0,
        stats.orderStats.delivered || 0,
        stats.orderStats.completed || 0
      ],
      backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#f44336'],
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
      <Title title={'Seller Overview'}/>

      {/* Cards Section */}
      <Row className="mb-4 g-4">
        {/* Products Statistics Card */}
        <Col xs={12} md={6} lg={4}>
          <Card className="text-white" style={{ backgroundColor: '#4caf50' }}>
            <Card.Body>
              <Card.Title><FaBox size={32} color="white" /> Products</Card.Title>
              <Card.Text>
                <strong>Total Products:</strong> {stats.productStats.totalProducts || 0}
              </Card.Text>
              <Card.Text>
                <strong>In Stock:</strong> {stats.productStats['In Stock'] || 0} {renderProductStatus('In Stock')}
              </Card.Text>
              <Card.Text>
                <strong>Out of Stock:</strong> {stats.productStats['Out of Stock'] || 0} {renderProductStatus('Out of Stock')}
              </Card.Text>
              <Card.Text>
                <strong>Rejected:</strong> {stats.productStats.rejected || 0} {renderProductStatus('Rejected')}
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
                <strong>Total Orders:</strong> {stats.orderStats.totalOrders || 0}
              </Card.Text>
              <Card.Text>
                <strong>Completed:</strong> {stats.orderStats.completed || 0} {renderOrderStatus('completed')}
              </Card.Text>
              <Card.Text>
                <strong>Paid:</strong> {stats.orderStats.paid || 0} {renderOrderStatus('paid')}
              </Card.Text>
              <Card.Text>
                <strong>Shipped:</strong> {stats.orderStats.shipped || 0} {renderOrderStatus('shipped')}
              </Card.Text>
              <Card.Text>
                <strong>Delivered:</strong> {stats.orderStats.delivered || 0} {renderOrderStatus('delivered')}
              </Card.Text>
              <Card.Text>
                <strong>Total Revenue:</strong> ${stats.orderStats.totalRevenue || 0}
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
                <strong>Profit:</strong> ${stats.totalProfit || 0}
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
