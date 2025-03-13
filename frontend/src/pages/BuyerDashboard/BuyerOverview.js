import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { 
  FaShoppingCart, FaClipboardList, FaComments, FaCreditCard,
  FaBoxOpen, FaTruck, FaCheckCircle, FaClock, FaLeaf
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Title from "../../components_part/TitleCard";

const BuyerOverview = () => {
  const [stats, setStats] = useState({
    orderStats: {
    totalOrders: 0,
      completed: 0,
      paid: 0,
      totalUnpaidOrders: 0,
      totalRefunded: 0
    },
    totalSpent: 0,
    recentOrders: [],
    recentProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: "My Cart",
      icon: <FaShoppingCart size={24} />,
      description: "View and manage items in your shopping cart",
      path: "/cart",
      color: "#15803d"
    },
    {
      title: "My Orders",
      icon: <FaClipboardList size={24} />,
      description: "Track and review your order history",
      path: "/buyer/orders",
      color: "#0369a1"
    },
    {
      title: "Messages",
      icon: <FaComments size={24} />,
      description: "Chat with sellers and support",
      path: "/chat",
      color: "#7e22ce"
    },
    {
      title: "Payments",
      icon: <FaCreditCard size={24} />,
      description: "View your payment history and transactions",
      path: "/payment",
      color: "#be185d"
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate('/auto');
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/v1/order/stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          const data = response.data.data || {};
          
          // Safely set the stats with default values
          setStats({
            orderStats: {
              totalOrders: data.orderStats?.totalOrders || 0,
              completed: data.orderStats?.deliveredOrders || 0,
              paid: data.orderStats?.pendingOrders || 0,
              totalUnpaidOrders: data.orderStats?.totalUnpaidOrders || 0,
              totalRefunded: data.orderStats?.totalRefunded || 0
            },
            totalSpent: data.orderStats?.totalSpent || 0,
            recentOrders: data.recentOrders || [],
            recentProducts: data.recentProducts || []
          });
        } else {
          setError(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.response?.data?.message || 'An error occurred while fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Data for Pie chart
  const orderChartData = {
    labels: ['Completed', 'Paid', 'Unpaid', 'Refunded'],
    datasets: [{
      data: [
        stats.orderStats.completed,
        stats.orderStats.paid,
        stats.orderStats.totalUnpaidOrders,
        stats.orderStats.totalRefunded
      ],
      backgroundColor: ['#4caf50', '#2196f3', '#f44336', '#ff9800'],
      borderWidth: 1,
    }],
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="overview-section">
      <Title title="Dashboard Overview" />

          <div className="stats-grid">
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon" style={{ backgroundColor: "#15803d20", color: "#15803d" }}>
                    <FaShoppingCart />
                  </div>
                  <div className="ms-3">
                    <h6 className="stat-title">Total Orders</h6>
                <h3 className="stat-value" style={{ color: "#15803d" }}>{stats.orderStats.totalOrders}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon" style={{ backgroundColor: "#ca8a0420", color: "#ca8a04" }}>
                    <FaClock />
                  </div>
                  <div className="ms-3">
                    <h6 className="stat-title">Pending Orders</h6>
                <h3 className="stat-value" style={{ color: "#ca8a04" }}>{stats.orderStats.totalUnpaidOrders}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="stat-icon" style={{ backgroundColor: "#0369a120", color: "#0369a1" }}>
                    <FaCheckCircle />
                  </div>
                  <div className="ms-3">
                    <h6 className="stat-title">Delivered Orders</h6>
                <h3 className="stat-value" style={{ color: "#0369a1" }}>{stats.orderStats.completed}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="quick-links-section">
            <h2 className="section-title">Quick Links</h2>
            <div className="quick-links-grid">
              {quickLinks.map((link, index) => (
                <div 
                  key={index} 
                  className="quick-link-card"
                  onClick={() => navigate(link.path)}
                  style={{ '--hover-color': link.color }}
                >
                  <div className="icon-wrapper" style={{ backgroundColor: `${link.color}20` }}>
                    {React.cloneElement(link.icon, { color: link.color })}
                  </div>
                  <h3>{link.title}</h3>
                  <p>{link.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Row className="mt-4">
            <Col lg={7} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <h5 className="mb-4">
                    <FaClipboardList className="me-2" />
                    Recent Orders
                  </h5>
                  <div className="recent-orders">
                    {stats.recentOrders?.length > 0 ? (
                      stats.recentOrders.map((order, index) => (
                        <div key={index} className="recent-order-item">
                          <div className="order-icon">
                            {order.status === 'pending' && <FaClock />}
                            {order.status === 'shipped' && <FaTruck />}
                            {order.status === 'delivered' && <FaCheckCircle />}
                          </div>
                          <div className="order-info">
                            <h6>{order.product?.name}</h6>
                            <p className="text-muted mb-0">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="order-status">
                            <span className={`status-badge ${order.status}`}>
                              {order.status}
                            </span>
                            <div className="order-amount">
                              ${order.totalAmount}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted text-center mb-0">No recent orders</p>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <h5 className="mb-4">
                    <FaLeaf className="me-2" />
                    Recently Viewed Products
                  </h5>
                  <div className="recent-products">
                    {stats.recentProducts?.length > 0 ? (
                      stats.recentProducts.map((product, index) => (
                        <div key={index} className="recent-product-item">
                          <img 
                            src={`${process.env.REACT_APP_BASE_URL}${product.image}`}
                            alt={product.name}
                            className="product-image"
                          />
                          <div className="product-info">
                            <h6>{product.name}</h6>
                            <p className="text-success mb-0">${product.price}</p>
                          </div>
                          <div className="product-status">
                            <FaBoxOpen className="me-1" />
                            {product.quantity} in stock
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted text-center mb-0">No recently viewed products</p>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

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

        .section-title {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .quick-link-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
        }

        .quick-link-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-color: var(--hover-color);
        }

        .icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .quick-link-card h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .quick-link-card p {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
        }

        .recent-order-item,
        .recent-product-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .recent-order-item:last-child,
        .recent-product-item:last-child {
          border-bottom: none;
        }

        .order-icon,
        .product-image {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          margin-right: 1rem;
        }

        .product-image {
          object-fit: cover;
        }

        .order-info,
        .product-info {
          flex: 1;
        }

        .order-info h6,
        .product-info h6 {
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-badge.shipped {
          background-color: #cce5ff;
          color: #004085;
        }

        .status-badge.delivered {
          background-color: #d4edda;
          color: #155724;
        }

        .order-amount {
          font-weight: 600;
          color: #15803d;
          margin-top: 0.25rem;
        }

        .product-status {
          font-size: 0.75rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .stats-grid,
          .quick-links-grid {
            grid-template-columns: 1fr;
          }
        }

        .alert {
          margin-bottom: 2rem;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default BuyerOverview; 