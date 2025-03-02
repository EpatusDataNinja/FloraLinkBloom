import { FaBell, FaUser, FaCog, FaSignOutAlt, FaEnvelope } from "react-icons/fa";
import Badge from "react-bootstrap/Badge";
import { useNavigate, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Image from './user.png'
import Title from "../components_part/TitleCard";

const Header = ({ setShow }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Logout logic here
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate("/auto");
    };

    useEffect(() => {
        // Fetch user information from localStorage or an API
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate("/auto");
        }

        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/notification/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUnreadCount(data.unreadCount || 0);
                } else {
                    console.error('Failed to fetch notifications');
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <header className="top-bar d-flex justify-content-between align-items-center p-3 bg-success text-white">
            <div className="d-flex align-items-center">
                <button className="btn btn-light d-md-none me-3" onClick={() => setShow(true)}>☰</button>
                <div className="d-flex flex-column ms-3">
                    <h2 className="mb-0 text-light">FloraLink</h2>
                    <span className="fw-light text-light">"{user?.role} Dashboard"</span>
                </div>
            </div>

            <input type="text" className="form-control w-50 d-none d-md-block" placeholder="Search..." />
            <div className="d-flex align-items-center position-relative">
                <button className="btn me-3 position-relative">

                    <div className="position-relative text-center">
                        <FaEnvelope className="me-3" style={{ color: 'white' }} size={24} />
                        <Link to="/notifications" className="text-light text-decoration-none">
                            <FaBell size={24} />
                            {unreadCount > 0 && (
                                <Badge pill bg="danger" className="position-absolute translate-middle">
                                    {unreadCount}
                                </Badge>
                            )}
                        </Link>
                    </div>


                </button>

                {/* Profile Section */}
                <div className="position-relative">
                    <div
                        className="d-flex align-items-center"
                        style={{ cursor: "pointer" }}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <img src={user?.image || Image} alt="User" className="rounded-circle" width="40" height="40" style={{ border: '3px solid white', backgroundColor:'white'}} />
                        <div className="ms-2 d-none d-md-block">
                            <strong>{user?.name || 'User'}</strong>
                            <small className="d-block">{user?.email || 'user@example.com'}</small>
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="position-absolute end-0 mt-2 bg-white shadow-sm rounded p-2" style={{ width: "180px", zIndex: 1000 }}>
                            <ul className="list-unstyled mb-0">
                                <li className="p-2 d-flex align-items-center" style={{ cursor: "pointer" }}>
                                    <FaUser className="me-2 text-success" />  <span style={{ color: 'green' }}>Profile</span>
                                </li>
                                <li className="p-2 d-flex align-items-center" style={{ cursor: "pointer" }}>
                                    <FaCog className="me-2 text-success" /> <span style={{ color: 'green' }}>Settings</span>
                                </li>
                                <li className="p-2 d-flex align-items-center text-danger" style={{ cursor: "pointer" }} onClick={handleLogout}>
                                    <FaSignOutAlt className="me-2" /> Logout
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
