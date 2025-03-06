import React, { useState, useEffect } from "react";
import { Offcanvas } from "react-bootstrap";
import { FaTachometerAlt, FaUsers, FaBox, FaShoppingCart, FaCog, FaBell, FaSignOutAlt, FaRegUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // Use Link and useNavigate for navigation

const Sidebar = ({ show, setShow }) => {
  const [activeItem, setActiveItem] = useState("Overview");
  const [obj, setObj] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logout logic here
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/auto");
  };

  const adminMenu = [
    { name: "Overview", icon: <FaTachometerAlt />, to: "/admin/overview" },
    { name: "Users management", icon: <FaUsers />, to: "/dashboard/users" },
    { name: "Orders", icon: <FaBox />, to: "/admin/orders" },
    { name: "Products modelation", icon: <FaBox />, to: "/admin/moderate_product" },
    { name: "Products list", icon: <FaBox />, to: "/product_list" },
    { name: "Notifications", icon: <FaBell />, to: "/notifications" },
    { name: "Profile Edit", icon: <FaRegUserCircle />, to: "/profile" },
    { name: "Manage Payments", icon: <FaShoppingCart />, to: "/payment" },
    { name: "Settings", icon: <FaCog />, to: "/settings" },
  ];

  const sellerMenu = [
    { name: "Home", icon: <FaTachometerAlt />, to: "/seller/overview" },
    { name: "Orders", icon: <FaBox />, to: "/seller/orders" },
    { name: "Manage Types", icon: <FaShoppingCart />, to: "/product/categories" },
    { name: "Post Product", icon: <FaBox />, to: "/add_product" },
    { name: "Products list", icon: <FaBox />, to: "/product_list" },
    { name: "Sales Report", icon: <FaBox />, to: "/sales/report" },
    { name: "Notifications", icon: <FaBell />, to: "/notifications" },
    { name: "Profile Edit", icon: <FaRegUserCircle />, to: "/profile" },
    { name: "Manage Payments", icon: <FaShoppingCart />, to: "/payment" },
    { name: "Chat", icon: <FaBox />, to: "/chat" },
    { name: "Settings", icon: <FaCog />, to: "/settings" },
  ];

  const buyerMenu = [
    { name: "Home", icon: <FaTachometerAlt />, to: "/buyer/overview" },
    { name: "Products", icon: <FaBox />, to: "/products" },
    { name: "Orders", icon: <FaShoppingCart />, to: "/buyer/orders" },
    { name: "Notifications", icon: <FaBell />, to: "/notifications" },
    { name: "Profile Edit", icon: <FaRegUserCircle />, to: "/profile" },
    { name: "Manage Payments", icon: <FaShoppingCart />, to: "/payment" },
    { name: "Chat", icon: <FaBox />, to: "/chat" },
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
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/notification`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

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
      {/* Sidebar for larger screens */}
      <aside className="col-md-2 d-none d-md-block bg-white sidebar border-end">
        <div className="p-3">
          <h4 className="text-center text-success fw-bold">{obj.role} Panel</h4>
        </div>
        <ul className="list-group list-group-flush">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`list-group-item d-flex align-items-center ${activeItem === item.name ? "bg-success text-white" : ""}`}
              onClick={() => setActiveItem(item.name)} // Set active item
            >
              <Link to={item.to} className="text-decoration-none text-dark d-flex align-items-center w-100">
                {item.icon}
                <span className="ms-2">{item.name}</span>
                {item.name === "Notifications" && unreadCount > 0 && (
                  <span className="badge bg-danger ms-2">{unreadCount}</span>
                )}
              </Link>
            </li>
          ))}
          <li className="p-2 d-flex align-items-center text-danger" style={{ cursor: "pointer", margin: '0.4cm' }} onClick={handleLogout}>
            <FaSignOutAlt className="me-2" /> Logout
          </li>
        </ul>
      </aside>

      {/* Offcanvas Sidebar for small screens */}
      <Offcanvas show={show} onHide={() => setShow(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ul className="list-group list-group-flush">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className={`list-group-item d-flex align-items-center ${activeItem === item.name ? "bg-success text-white" : ""}`}
                onClick={() => {
                  setActiveItem(item.name);
                  setShow(false); // Close offcanvas after selection
                }}
              >
                <Link to={item.to} className="text-decoration-none text-dark d-flex align-items-center w-100">
                  {item.icon}
                  <span className="ms-2">{item.name}</span>
                  {item.name === "Notifications" && unreadCount > 0 && (
                    <span className="badge bg-danger ms-2">{unreadCount}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;
