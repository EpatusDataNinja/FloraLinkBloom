import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { FaUsers, FaBox, FaShoppingCart, FaDollarSign } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Title from "../../components_part/TitleCard";
// Register chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const OverviewStatistics = () => {
  const [stats, setStats] = useState(null);
  let token = localStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/admin/overview`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
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
  const userChartData = {
    labels: ['Buyers', 'Sellers', 'Admins'],
    datasets: [{
      data: [stats.userStats.buyers, stats.userStats.sellers, stats.userStats.admins],
      backgroundColor: ['#4caf50', '#ff9800', '#2196f3'], // Green, Orange, Blue
      borderWidth: 1,
    }],
  };

  const productChartData = {
    labels: ['In Stock', 'Out of Stock', 'Rejected'],
    datasets: [{
      data: [stats.productStats['In Stock'], stats.productStats['Out of Stock'], stats.productStats.rejected],
      backgroundColor: ['#4caf50', '#f44336', '#ff9800'], // Green, Red, Orange
      borderWidth: 1,
    }],
  };

  const orderChartData = {
    labels: ['Paid', 'Completed', 'Unpaid'],
    datasets: [{
      data: [stats.orderStats.paid, stats.orderStats.completed, stats.orderStats.totalOrders - stats.orderStats.paid],
      backgroundColor: ['#4caf50', '#2196f3', '#f44336'], // Green, Blue, Red
      borderWidth: 1,
    }],
  };

  return (
    <div className="container mt-4">
      <Title title={'Admin dashboard Overview'}/>

      {/* Cards Section */}
      <Row className="mb-4 g-4"> {/* g-4 to add gutter spacing between columns */}
        {/* Users Statistics Card */}
        <Col xs={12} md={6} lg={3}>
          <Card className="text-white" style={{ backgroundColor: '#2196f3' }}>
            <Card.Body>
              <Card.Title><FaUsers size={32} color="white" /> Users</Card.Title>
              <Card.Text>
                <strong>Total Users:</strong> {stats.userStats.totalUsers}
              </Card.Text>
              <Card.Text>
                <strong>Buyers:</strong> {stats.userStats.buyers}
              </Card.Text>
              <Card.Text>
                <strong>Sellers:</strong> {stats.userStats.sellers}
              </Card.Text>
              <Card.Text>
                <strong>Admins:</strong> {stats.userStats.admins}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Products Statistics Card */}
        <Col xs={12} md={6} lg={3}>
          <Card className="text-white" style={{ backgroundColor: '#4caf50' }}>
            <Card.Body>
              <Card.Title><FaBox size={32} color="white" /> Products</Card.Title>
              <Card.Text>
                <strong>Total Products:</strong> {stats.productStats.totalProducts}
              </Card.Text>
              <Card.Text>
                <strong>In Stock:</strong> {stats.productStats['In Stock']}
              </Card.Text>
              <Card.Text>
                <strong>Out of Stock:</strong> {stats.productStats['Out of Stock']}
              </Card.Text>
              <Card.Text>
                <strong>Rejected:</strong> {stats.productStats.rejected}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Orders Statistics Card */}
        <Col xs={12} md={6} lg={3}>
          <Card className="text-white" style={{ backgroundColor: '#ff9800' }}>
            <Card.Body>
              <Card.Title><FaShoppingCart size={32} color="white" /> Orders</Card.Title>
              <Card.Text>
                <strong>Total Orders:</strong> {stats.orderStats.totalOrders}
              </Card.Text>
              <Card.Text>
                <strong>Completed:</strong> {stats.orderStats.completed}
              </Card.Text>
              <Card.Text>
                <strong>Paid:</strong> {stats.orderStats.paid}
              </Card.Text>
              <Card.Text>
                <strong>Total Revenue:</strong> ${stats.orderStats.totalRevenue.toLocaleString()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Profit Card */}
        <Col xs={12} md={6} lg={3}>
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
        {/* Users Chart */}
        <Col xs={12} md={4}>
          <Card>
            <Card.Body>
              <Card.Title>User Breakdown</Card.Title>
              <Pie data={userChartData} />
            </Card.Body>
          </Card>
        </Col>

        {/* Products Chart */}
        <Col xs={12} md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Product Breakdown</Card.Title>
              <Pie data={productChartData} />
            </Card.Body>
          </Card>
        </Col>

        {/* Orders Chart */}
        <Col xs={12} md={4}>
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

export default OverviewStatistics;
