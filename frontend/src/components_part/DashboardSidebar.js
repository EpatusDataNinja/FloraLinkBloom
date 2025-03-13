import React, { useState, useEffect } from "react";
import { Offcanvas } from "react-bootstrap";
import { 
  FaTachometerAlt, FaUsers, FaBox, FaShoppingCart, FaCog, 
  FaBell, FaSignOutAlt, FaRegUserCircle, FaLeaf, FaCreditCard,
  FaComments, FaChartLine, FaStore, FaChartBar, FaFileAlt
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ show, setShow }) => {
  const [activeItem, setActiveItem] = useState("");
  const [obj, setObj] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const capitalizeWords = (str) => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/auto");
  };

  const adminMenu = [
    { name: "Overview", icon: <FaTachometerAlt />, to: "/admin/overview" },
    { name: "Users Management", icon: <FaUsers />, to: "/dashboard/users" },
    { name: "Orders", icon: <FaShoppingCart />, to: "/admin/orders" },
    { name: "Pending Products", icon: <FaLeaf />, to: "/admin/pending_products" },
    { name: "Products Moderation", icon: <FaStore />, to: "/admin/moderate_product" },
    {
      name: "Reports",
      icon: <FaChartBar />,
      submenu: [
        { name: "Sales Report", icon: <FaFileAlt />, to: "/admin/reports/sales" },
        { name: "Product Performance", icon: <FaFileAlt />, to: "/admin/reports/products" },
        { name: "User Activity", icon: <FaFileAlt />, to: "/admin/reports/users" },
        { name: "Seasonal Trends", icon: <FaFileAlt />, to: "/admin/reports/seasonal" },
        { name: "Stock & Perishability", icon: <FaFileAlt />, to: "/admin/reports/stock" }
      ]
    },
    { name: "Notifications", icon: <FaBell />, to: "/notifications" },
    { name: "Profile Edit", icon: <FaRegUserCircle />, to: "/profile" },
    { name: "Manage Payments", icon: <FaCreditCard />, to: "/payment" },
    { name: "Settings", icon: <FaCog />, to: "/settings" },
  ];

  const sellerMenu = [
    { name: "Overview", icon: <FaTachometerAlt />, to: "/seller/overview" },
    { name: "Orders", icon: <FaShoppingCart />, to: "/seller/orders" },
    { name: "Manage Types", icon: <FaLeaf />, to: "/product/categories" },
    { name: "Post Product", icon: <FaStore />, to: "/add_product" },
    { name: "Products List", icon: <FaBox />, to: "/product_list" },
    { name: "Sales Report", icon: <FaChartLine />, to: "/sales/report" },
    { name: "Notifications", icon: <FaBell />, to: "/notifications" },
    { name: "Profile Edit", icon: <FaRegUserCircle />, to: "/profile" },
    { name: "Manage Payments", icon: <FaCreditCard />, to: "/payment" },
    { name: "Chat", icon: <FaComments />, to: "/chat" },
    { name: "Settings", icon: <FaCog />, to: "/settings" },
  ];

  const buyerMenu = [
    { name: "Overview", icon: <FaTachometerAlt />, to: "/dashboard/buyer" },
    { name: "Products", icon: <FaLeaf />, to: "/products" },
    { name: "Orders", icon: <FaShoppingCart />, to: "/buyer/orders" },
    { name: "Notifications", icon: <FaBell />, to: "/notifications" },
    { name: "Profile Edit", icon: <FaRegUserCircle />, to: "/profile" },
    { name: "Manage Payments", icon: <FaCreditCard />, to: "/payment" },
    { name: "Chat", icon: <FaComments />, to: "/chat" },
    { name: "Settings", icon: <FaCog />, to: "/settings" },
  ];

  useEffect(() => {
    if (!localStorage.getItem('token') || !localStorage.getItem('user')) {
      navigate('/auto');
    } else {
      const user = JSON.parse(localStorage.getItem('user'));
      setObj(user);
    }
  }, [navigate]);

  useEffect(() => {
    const currentPath = location.pathname;
    const menu = getMenu();
    const currentItem = menu.find(item => currentPath.includes(item.to));
    if (currentItem) {
      setActiveItem(currentItem.name);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/notification`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMenu = () => {
    if (obj.role === 'admin') return adminMenu;
    if (obj.role === 'seller') return sellerMenu;
    if (obj.role === 'buyer') return buyerMenu;
    return [];
  };

  const menuItems = getMenu();

  return (
    <>
      <aside className="dashboard-sidebar d-none d-md-block">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <FaLeaf className="brand-icon" />
            <h4>{capitalizeWords(`${obj.role} Panel`)}</h4>
          </div>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <>
                  <div
                    className={`menu-item ${activeItem === item.name ? "active" : ""}`}
                    onClick={() => setExpandedMenu(expandedMenu === item.name ? null : item.name)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">{capitalizeWords(item.name)}</span>
                    <span className="submenu-arrow">▼</span>
                  </div>
                  {expandedMenu === item.name && (
                    <div className="submenu">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.to}
                          className={`submenu-item ${activeItem === subItem.name ? "active" : ""}`}
                          onClick={() => setActiveItem(subItem.name)}
                        >
                          <span className="menu-icon">{subItem.icon}</span>
                          <span className="menu-text">{capitalizeWords(subItem.name)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.to}
                  className={`menu-item ${activeItem === item.name ? "active" : ""}`}
                  onClick={() => setActiveItem(item.name)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-text">{capitalizeWords(item.name)}</span>
                  {item.name === "Notifications" && unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </Link>
              )}
            </div>
          ))}

          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <Offcanvas show={show} onHide={() => setShow(false)} placement="start" className="mobile-sidebar">
        <Offcanvas.Header closeButton className="mobile-sidebar-header">
          <div className="sidebar-brand">
            <FaLeaf className="brand-icon" />
            <h4>{capitalizeWords(`${obj.role} Panel`)}</h4>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body className="mobile-sidebar-body">
          <div className="sidebar-menu">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <>
                    <div
                      className={`menu-item ${activeItem === item.name ? "active" : ""}`}
                      onClick={() => setExpandedMenu(expandedMenu === item.name ? null : item.name)}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{capitalizeWords(item.name)}</span>
                      <span className="submenu-arrow">▼</span>
                    </div>
                    {expandedMenu === item.name && (
                      <div className="submenu">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.to}
                            className={`submenu-item ${activeItem === subItem.name ? "active" : ""}`}
                            onClick={() => {
                              setActiveItem(subItem.name);
                              setShow(false);
                            }}
                          >
                            <span className="menu-icon">{subItem.icon}</span>
                            <span className="menu-text">{capitalizeWords(subItem.name)}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.to}
                    className={`menu-item ${activeItem === item.name ? "active" : ""}`}
                    onClick={() => {
                      setActiveItem(item.name);
                      setShow(false);
                    }}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">{capitalizeWords(item.name)}</span>
                    {item.name === "Notifications" && unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount}</span>
                    )}
                  </Link>
                )}
              </div>
            ))}

            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <style jsx="true">{`
        .dashboard-sidebar {
          width: 280px;
          height: calc(100vh - 70px);
          background: white;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          position: fixed;
          top: 70px;
          left: 0;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
        }

        /* Main content positioning */
        :global(.main-content) {
          margin-left: 280px;
          padding: 1rem;
          min-height: calc(100vh - 70px);
          transition: margin-left 0.3s ease;
        }

        :global(.container-fluid) {
          padding-left: 280px !important;
          transition: padding-left 0.3s ease;
        }

        @media (max-width: 768px) {
          :global(.main-content),
          :global(.container-fluid) {
            margin-left: 0 !important;
            padding-left: 1rem !important;
          }
        }

        .sidebar-header {
          padding: 1.5rem;
          background: #15803d;
          color: white;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          font-size: 1.5rem;
          color: white;
        }

        .sidebar-brand h4 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .sidebar-menu {
          padding: 1rem 0;
        }

        .menu-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          color: #374151;
          text-decoration: none;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
          gap: 0.75rem;
          position: relative;
        }

        .menu-item:hover {
          background: #f0fdf4;
          color: #15803d;
          border-left-color: #15803d;
        }

        .menu-item.active {
          background: #f0fdf4;
          color: #15803d;
          border-left-color: #15803d;
          font-weight: 600;
        }

        .menu-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-text {
          font-size: 0.875rem;
        }

        .notification-badge {
          position: absolute;
          right: 1rem;
          background: #dc2626;
          color: white;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-weight: 600;
        }

        .logout-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 1rem;
          border-left: 3px solid transparent;
        }

        .logout-button:hover {
          background: #fef2f2;
          border-left-color: #dc2626;
        }

        /* Custom Scrollbar */
        .dashboard-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .dashboard-sidebar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .dashboard-sidebar::-webkit-scrollbar-thumb {
          background: #15803d;
          border-radius: 3px;
        }

        /* Mobile Sidebar Styles */
        .mobile-sidebar {
          width: 280px !important;
          z-index: 1050;
        }

        .mobile-sidebar-header {
          background: #15803d;
          padding: 1rem;
        }

        .mobile-sidebar-header .btn-close {
          color: white;
          filter: brightness(0) invert(1);
        }

        .mobile-sidebar-body {
          padding: 0;
        }

        @media (max-width: 768px) {
          .dashboard-sidebar {
            display: none;
          }
        }

        .submenu {
          background: #f8f9fa;
          margin-left: 20px;
        }

        .submenu-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 1.5rem;
          color: #374151;
          text-decoration: none;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
          font-size: 0.875rem;
        }

        .submenu-item:hover {
          background: #f0fdf4;
          color: #15803d;
          border-left-color: #15803d;
        }

        .submenu-arrow {
          margin-left: auto;
          transition: transform 0.2s ease;
        }

        .menu-item.active .submenu-arrow {
          transform: rotate(180deg);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
