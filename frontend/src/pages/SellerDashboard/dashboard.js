import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import { 
  FaBox, FaShoppingCart, FaDollarSign, FaChartLine, 
  FaLeaf, FaWarehouse, FaBoxOpen, FaClipboardCheck,
  FaThermometerHalf, FaCalendarAlt, FaSeedling,
  FaTruck, FaExclamationCircle, FaSyncAlt
} from "react-icons/fa";
import Title from "../../components_part/TitleCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    productStats: {
      totalProducts: 0,
      'In Stock': 0,
      'Out of Stock': 0,
      rejected: 0,
      byCategory: {},
      lowStock: 0
    },
    orderStats: {
      totalOrders: 0,
      revenue: 0,
      completed: 0,
      processing: 0,
      pending: 0,
      paid: 0,
      shipped: 0,
      delivered: 0
    },
    performance: {
      growth: '0%',
      monthlyRevenue: 0,
      totalProfit: 0,
      categoryPerformance: {},
      dailyRevenue: [],
      weeklyRevenue: [],
      monthlyRevenue: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return (value / total) * 100;
  };

  const getDailyRevenue = (orders, days) => {
    const dailyData = new Array(days).fill(0);
    const now = new Date();
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      if (dayDiff < days) {
        dailyData[dayDiff] += parseFloat(order.totalAmount);
      }
    });
    
    return dailyData;
  };

  const getWeeklyRevenue = (orders, weeks) => {
    const weeklyData = new Array(weeks).fill(0);
    const now = new Date();
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const weekDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24 * 7));
      if (weekDiff < weeks) {
        weeklyData[weekDiff] += parseFloat(order.totalAmount);
      }
    });
    
    return weeklyData;
  };

  const getMonthlyRevenue = (orders, months) => {
    const monthlyData = new Array(months).fill(0);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();
      
      const monthDiff = (currentYear - orderYear) * 12 + (currentMonth - orderMonth);
      
      if (monthDiff < months) {
        monthlyData[monthDiff] += parseFloat(order.totalAmount);
      }
    });
    
    return monthlyData;
  };

  const calculateTimeBasedMetrics = (orders) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return {
      daily: getDailyRevenue(orders, 30),
      weekly: getWeeklyRevenue(orders, 12),
      monthly: getMonthlyRevenue(orders, 12),
      yearToDate: orders
        .filter(order => new Date(order.createdAt).getFullYear() === thisYear)
        .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)
    };
  };

  const calculateGrowthPercentage = (orders) => {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth - 1;
    
    const currentMonthOrders = orders.filter(order => 
      new Date(order.createdAt).getMonth() === currentMonth
    );
    
    const lastMonthOrders = orders.filter(order => 
      new Date(order.createdAt).getMonth() === lastMonth
    );

    const currentRevenue = currentMonthOrders.reduce((sum, order) => 
      sum + parseFloat(order.totalAmount), 0);
    const lastRevenue = lastMonthOrders.reduce((sum, order) => 
      sum + parseFloat(order.totalAmount), 0);

    if (lastRevenue === 0) return currentRevenue > 0 ? '100%' : '0%';
    return `${((currentRevenue - lastRevenue) / lastRevenue * 100).toFixed(2)}%`;
  };

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/v1/users/seller/overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      console.log('API Response:', response.data);

      if (response.data.success) {
        const data = response.data;
        const orders = data.orders || [];
        const products = data.products || [];

        // Calculate order statistics
        const orderStats = {
          pending: orders.filter(order => order.status === 'pending').length,
          paid: orders.filter(order => order.status === 'paid').length,
          shipped: orders.filter(order => order.status === 'shipped').length,
          delivered: orders.filter(order => order.status === 'delivered').length,
          completed: orders.filter(order => order.status === 'completed').length,
          refunded: orders.filter(order => order.status === 'refunded').length
        };

        // Calculate payment statistics
        const paymentStats = {
          totalPaid: orders.filter(order => order.status === 'paid' || order.status === 'completed')
            .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0),
          pendingPayments: orders.filter(order => order.status === 'pending')
            .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0),
          refundedAmount: orders.filter(order => order.status === 'refunded')
            .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0)
        };

        // Calculate monthly revenue and growth
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const lastMonth = currentMonth - 1;

        const currentMonthOrders = orders.filter(order => 
          new Date(order.createdAt).getMonth() === currentMonth
        );

        const lastMonthOrders = orders.filter(order => 
          new Date(order.createdAt).getMonth() === lastMonth
        );

        const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => 
          sum + parseFloat(order.totalAmount || 0), 0
        );

        const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => 
          sum + parseFloat(order.totalAmount || 0), 0
        );

        const growth = lastMonthRevenue === 0 
          ? (currentMonthRevenue > 0 ? '100%' : '0%')
          : `${((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2)}%`;

        // Set the final state
        setStats({
          productStats: {
            totalProducts: data.productStats?.totalProducts || 0,
            'In Stock': data.productStats?.['In Stock'] || 0,
            'Out of Stock': products.filter(p => p.quantity <= 0).length || 0,
            lowStock: products.filter(p => p.quantity > 0 && p.quantity <= (p.lowStockThreshold || 5)).length || 0,
            byCategory: data.productStats?.byCategory || {}
          },
          orderStats: {
            ...orderStats,
            totalOrders: orders.length,
            activeOrders: orderStats.pending + orderStats.processing,
            revenue: currentMonthRevenue
          },
          performance: {
            growth,
            monthlyRevenue: currentMonthRevenue,
            totalProfit: paymentStats.totalPaid,
            pendingPayments: paymentStats.pendingPayments,
            refundedAmount: paymentStats.refundedAmount,
            categoryPerformance: data.productStats?.byCategory || {}
          }
        });

        console.log('Updated Stats:', {
          productStats: data.productStats,
          orderStats,
          paymentStats,
          performance: {
            growth,
            monthlyRevenue: currentMonthRevenue
          }
        });

        } else {
        throw new Error(response.data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setError(err.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      setIsRefreshing(false);
      }
    };

  useEffect(() => {
    fetchStats();
  }, []);

    return (
    <div className="overview-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Title title="Flower Shop Dashboard" />
        <Button 
          variant="outline-primary"
          onClick={fetchStats}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Refreshing...
            </>
          ) : (
            <>
              <FaSyncAlt className="me-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

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
                    <FaLeaf />
                  </div>
                  <div className="ms-3">
                    <h6 className="stat-title">Active Products</h6>
                    <h3 className="stat-value" style={{ color: "#15803d" }}>
                      {stats.productStats['In Stock'] || 0}
                    </h3>
                    <small className="text-muted">Available Varieties</small>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon" style={{ backgroundColor: "#dc262620", color: "#dc2626" }}>
                    <FaExclamationCircle />
                  </div>
                  <div className="ms-3">
                    <h6 className="stat-title">Stock Alerts</h6>
                    <h3 className="stat-value" style={{ color: "#dc2626" }}>
                      {stats.productStats.lowStock || 0}
                    </h3>
                    <small className="text-muted">Low Stock Items</small>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon" style={{ backgroundColor: "#0369a120", color: "#0369a1" }}>
                    <FaTruck />
                  </div>
                  <div className="ms-3">
                    <h6 className="stat-title">Active Orders</h6>
                    <h3 className="stat-value" style={{ color: "#0369a1" }}>
                      {stats.orderStats.activeOrders || 0}
                    </h3>
                    <small className="text-muted">Pending & Processing</small>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon" style={{ backgroundColor: "#7e22ce20", color: "#7e22ce" }}>
                    <FaDollarSign />
                  </div>
                  <div className="ms-3">
                    <h6 className="stat-title">Monthly Revenue</h6>
                    <h3 className="stat-value" style={{ color: "#7e22ce" }}>
                      Rwf{(stats.performance.monthlyRevenue || 0).toLocaleString()}
                    </h3>
                    <small className="text-muted">
                      {stats.performance.growth || '0%'} vs last month
                    </small>
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
                    <FaWarehouse className="me-2" />
                    Inventory Status
                  </h5>
                  <div className="product-stats">
                    {['In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
                      <div key={status} className="product-stat-item mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>{status}</span>
                          <span className="stat-number">
                            {status === 'Low Stock' 
                              ? stats.productStats.lowStock 
                              : stats.productStats[status] || 0}
                          </span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${calculatePercentage(
                                status === 'Low Stock' 
                                  ? stats.productStats.lowStock 
                                  : stats.productStats[status] || 0,
                                stats.productStats.totalProducts || 0
                              )}%`,
                              backgroundColor: status === 'In Stock' ? '#15803d' :
                                            status === 'Low Stock' ? '#ca8a04' : '#dc2626'
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
                    <FaCalendarAlt className="me-2" />
                    Order Fulfillment
                  </h5>
                  <div className="order-stats">
                    {['Pending', 'Processing', 'Shipped', 'Delivered'].map((status) => (
                      <div key={status} className="order-stat-item mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>{status}</span>
                          <span className="stat-number">
                            {stats.orderStats[status.toLowerCase()] || 0}
                          </span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${calculatePercentage(
                                stats.orderStats[status.toLowerCase()] || 0,
                                stats.orderStats.totalOrders || 0
                              )}%`,
                              backgroundColor: status === 'Delivered' ? '#15803d' :
                                            status === 'Shipped' ? '#0369a1' :
                                            status === 'Processing' ? '#7e22ce' : '#ca8a04'
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
          padding: 20px;
          background: #f8f9fa;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .stat-card {
          transition: transform 0.2s ease-in-out;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .progress {
          height: 8px;
          border-radius: 4px;
        }
        .progress-bar {
          transition: width 0.6s ease;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default SellerDashboard;
