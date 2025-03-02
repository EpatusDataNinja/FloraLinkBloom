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
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/buyer/overview`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
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
  const orderChartData = {
    labels: ['Completed', 'Paid', 'Unpaid', 'Refunded'],
    datasets: [{
      data: [stats.orderStats.completed, stats.orderStats.paid, stats.orderStats.totalUnpaidOrders, stats.orderStats.totalRefunded],
      backgroundColor: ['#4caf50', '#2196f3', '#f44336', '#ff9800'], // Green, Blue, Red, Orange
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
      <Row className="mb-4 g-4"> {/* g-4 to add gutter spacing between columns */}
        {/* Orders Statistics Card */}
        <Col xs={12} md={6} lg={4}>
          <Card className="text-white" style={{ backgroundColor: '#2196f3' }}>
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
                <strong>Refunded:</strong> {stats.orderStats.totalRefunded} {renderOrderStatus('refunded')}
              </Card.Text>
              <Card.Text>
                <strong>Total Spent:</strong> ${stats.orderStats.totalSpent}
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
                <strong>Total Spent:</strong> ${stats.totalSpent}
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
