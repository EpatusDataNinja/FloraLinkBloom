import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaDollarSign } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Title from "../../components_part/TitleCard";
// Register chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const BuyerOverview = () => {
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

        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/buyer/overview`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch buyer overview');
        }

        const data = await response.json();
        if (data.success) {
          setStats(data);
        } else {
          throw new Error(data.message || 'Failed to fetch buyer overview');
        }
      } catch (error) {
        console.error('Error fetching buyer overview:', error);
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
  const orderChartData = {
    labels: ['Completed', 'Paid', 'Unpaid', 'Refunded'],
    datasets: [{
      data: [
        stats.orderStats.completed || 0,
        stats.orderStats.paid || 0,
        stats.orderStats.totalUnpaidOrders || 0,
        stats.orderStats.totalRefunded || 0
      ],
      backgroundColor: ['#4caf50', '#2196f3', '#f44336', '#ff9800'],
      borderWidth: 1,
    }],
  };

  // Helper function to render dynamic order status
  const renderOrderStatus = (status) => {
    switch (status) {
      case 'paid':
        return <Badge bg="success">Paid</Badge>;
      case 'completed':
        return <Badge bg="primary">Completed</Badge>;
      case 'unpaid':
        return <Badge bg="danger">Unpaid</Badge>;
      case 'refunded':
        return <Badge bg="warning">Refunded</Badge>;
      default:
        return <Badge bg="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="container mt-4">
      <Title title={'Buyer Overview'}/>

      {/* Cards Section */}
      <Row className="mb-4 g-4">
        {/* Orders Statistics Card */}
        <Col xs={12} md={6} lg={4}>
          <Card className="text-white" style={{ backgroundColor: '#2196f3' }}>
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
                <strong>Refunded:</strong> {stats.orderStats.totalRefunded || 0} {renderOrderStatus('refunded')}
              </Card.Text>
              <Card.Text>
                <strong>Total Spent:</strong> ${stats.totalSpent || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Spent Card */}
        <Col xs={12} md={6} lg={4}>
          <Card className="text-white" style={{ backgroundColor: '#ff9800' }}>
            <Card.Body>
              <Card.Title><FaDollarSign size={32} color="white" /> Total Spent</Card.Title>
              <Card.Text>
                <strong>Total Spent:</strong> ${stats.totalSpent || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Graphs Section */}
      <Row className="mb-4 g-4">
        {/* Orders Chart */}
        <Col xs={8}>
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

export default BuyerOverview;
