import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import {
  FaUsers, FaStore, FaShoppingCart,
  FaUserFriends, FaChartLine, FaMoneyBillWave
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from 'chart.js';
import Title from "../../components_part/TitleCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

const AdminOverview = () => {
  const [stats, setStats] = useState({
    userStats: {
      totalUsers: 0,
      buyers: 0,
      sellers: 0,
      admins: 0
    },
    productStats: {
      totalProducts: 0,
      'In Stock': 0,
      'Out of Stock': 0,
      rejected: 0
    },
    orderStats: {
      totalOrders: 0,
      totalRevenue: 0,
      completed: 0,
      pending: 0,
      processing: 0
    },
    revenueStats: {
      monthlyRevenue: 0,
      growth: '0%',
      platformFees: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setStats(data);
        } else {
          throw new Error(data.message || 'Failed to fetch statistics');
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return (value / total) * 100;
  };

  return (
    <div className="overview-section">
      <Title title="Admin Dashboard Overview" />

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon" style={{ backgroundColor: "#15803d20", color: "#15803d" }}>
                    <FaUsers />
                  </div>
                  <div className="ms-3">
                    <h6 className="stat-title">Total Users</h6>
                    <h3 className="stat-value" style={{ color: "#15803d" }}>
                      {stats?.userStats?.totalUsers || 0}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon" style={{ backgroundColor: "#0369a120", color: "#0369a1" }}>
                    <FaStore />
                  </div>
                  <div className="ms-3">
                    <h6 className="stat-title">Active Sellers</h6>
                    <h3 className="stat-value" style={{ color: "#0369a1" }}>
                      {stats?.userStats?.sellers || 0}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon" style={{ backgroundColor: "#7e22ce20", color: "#7e22ce" }}>
                    <FaMoneyBillWave />
                  </div>
                  <div className="ms-3">
                    <h6 className="stat-title">Platform Revenue</h6>
                    <h3 className="stat-value" style={{ color: "#7e22ce" }}>
                      ${stats?.revenueStats?.platformFees || 0}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon" style={{ backgroundColor: "#ca8a0420", color: "#ca8a04" }}>
                    <FaChartLine />
                  </div>
                  <div className="ms-3">
                    <h6 className="stat-title">Monthly Growth</h6>
                    <h3 className="stat-value" style={{ color: "#ca8a04" }}>
                      {stats?.revenueStats?.growth || '0%'}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          <Row className="mt-4">
            <Col lg={7} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <h5 className="mb-4">
                    <FaUserFriends className="me-2" />
                    User Distribution
                  </h5>
                  <div className="user-stats">
                    {['buyers', 'sellers', 'admins'].map((userType) => (
                      <div key={userType} className="user-stat-item">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-capitalize">{userType}</span>
                          <span className="stat-number">
                            {stats?.userStats?.[userType] || 0}
                          </span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${calculatePercentage(
                                stats?.userStats?.[userType] || 0,
                                stats?.userStats?.totalUsers || 0
                              )}%`,
                              backgroundColor: userType === 'buyers' ? '#15803d' : 
                                            userType === 'sellers' ? '#0369a1' : '#7e22ce'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <h5 className="mb-4">
                    <FaShoppingCart className="me-2" />
                    Order Status
                  </h5>
                  <div className="order-stats">
                    {['Completed', 'Processing', 'Pending'].map((status) => (
                      <div key={status} className="order-stat-item mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>{status}</span>
                          <span className="stat-number">
                            {stats?.orderStats?.[status.toLowerCase()] || 0}
                          </span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${calculatePercentage(
                                stats?.orderStats?.[status.toLowerCase()] || 0,
                                stats?.orderStats?.totalOrders || 0
                              )}%`,
                              backgroundColor: status === 'Completed' ? '#15803d' :
                                            status === 'Processing' ? '#0369a1' : '#ca8a04'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      <style jsx="true">{`
        .overview-section {
          width: 100%;
          padding: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-title {
          color: #6b7280;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0;
        }

        .user-stat-item,
        .order-stat-item {
          margin-bottom: 1.5rem;
        }

        .progress {
          height: 8px;
          border-radius: 4px;
          background-color: #f3f4f6;
        }

        .progress-bar {
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .stat-number {
          font-weight: 600;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOverview;
