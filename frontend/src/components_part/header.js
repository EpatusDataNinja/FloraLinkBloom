import { FaBell, FaUser, FaCog, FaSignOutAlt, FaEnvelope, FaShoppingCart, FaSearch } from "react-icons/fa";
import Badge from "react-bootstrap/Badge";
import { useNavigate, Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Image from './user.png'
import Title from "../components_part/TitleCard";

const Header = ({ setShow }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate("/auto");
    };

    const handleProfileClick = () => {
        setDropdownOpen(false);
        navigate('/profile');
    };

    const handleSettingsClick = () => {
        setDropdownOpen(false);
        if (user?.role === 'seller') {
            navigate('/seller-dashboard/settings');
        } else if (user?.role === 'buyer') {
            navigate('/buyer-dashboard/settings');
        } else if (user?.role === 'admin') {
            navigate('/admin-dashboard/settings');
        }
    };

    useEffect(() => {
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
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/notification`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.success) {
                    setUnreadCount(data.unreadCount || 0);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.profile-dropdown')) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    useEffect(() => {
        const updateCartCount = () => {
            const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
            setCartItemsCount(cartItems.length);
        };

        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        const interval = setInterval(updateCartCount, 1000);

        return () => {
            window.removeEventListener('storage', updateCartCount);
            clearInterval(interval);
        };
    }, []);

    const getRoleColor = () => {
        switch (user?.role) {
            case 'admin': return '#134e2c';
            case 'seller': return '#134e2c';
            case 'buyer': return '#134e2c';
            default: return '#134e2c';
        }
    };

    const capitalizeRole = (role) => {
        return role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
    };

    return (
        <header className="dashboard-header">
            <div className="header-left">
                <button className="menu-toggle" onClick={() => setShow(true)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div className="brand-section">
                    <h2 className="brand-title">FloraLink</h2>
                    <span className="role-badge">
                        {capitalizeRole(user?.role)} Dashboard
                    </span>
                </div>
            </div>

            <div className="header-center">
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder={`Search in ${capitalizeRole(user?.role)} Dashboard...`}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="header-right">
                <div className="header-actions">
                    <button className="action-button">
                        <FaEnvelope />
                    </button>
                    
                    <Link to="/notifications" className="action-button notification-button">
                        <FaBell />
                            {unreadCount > 0 && (
                            <Badge pill bg="danger" className="notification-badge">
                                    {unreadCount}
                                </Badge>
                            )}
                        </Link>

                {user?.role === 'buyer' && (
                    <button 
                            className="action-button cart-button"
                        onClick={() => navigate('/cart')}
                    >
                            <FaShoppingCart />
                        {cartItemsCount > 0 && (
                                <Badge pill bg="danger" className="cart-badge">
                                {cartItemsCount}
                            </Badge>
                        )}
                    </button>
                )}
                </div>

                <div className="profile-dropdown">
                    <div
                        className="profile-trigger"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <img 
                            src={user?.image || Image} 
                            alt={user?.firstname} 
                            className="profile-image"
                        />
                        <div className="profile-info">
                            <span className="profile-name">
                                {user?.firstname} {user?.lastname}
                            </span>
                            <span className="profile-email">{user?.email}</span>
                        </div>
                    </div>

                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <button onClick={handleProfileClick} className="dropdown-item">
                                <FaUser /> Profile
                            </button>
                            <button onClick={handleSettingsClick} className="dropdown-item">
                                <FaCog /> Settings
                            </button>
                            <button onClick={handleLogout} className="dropdown-item text-danger">
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx="true">{`
                .dashboard-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 2rem;
                    background: #15803d;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    height: 70px;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .menu-toggle {
                    display: none;
                    flex-direction: column;
                    gap: 4px;
                    background: none;
                    border: none;
                    padding: 4px;
                    cursor: pointer;
                }

                .menu-toggle span {
                    display: block;
                    width: 24px;
                    height: 2px;
                    background-color: white;
                    transition: all 0.3s ease;
                }

                .brand-section {
                    display: flex;
                    flex-direction: column;
                }

                .brand-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: white;
                    margin: 0;
                }

                .role-badge {
                    font-size: 0.875rem;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 12px;
                    margin-top: 4px;
                    background-color: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(4px);
                }

                .header-center {
                    flex: 1;
                    max-width: 600px;
                    margin: 0 2rem;
                }

                .search-container {
                    position: relative;
                    width: 100%;
                }

                .search-input {
                    width: 100%;
                    padding: 0.5rem 1rem 0.5rem 2.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    transition: all 0.3s ease;
                    background-color: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .search-input::placeholder {
                    color: rgba(255, 255, 255, 0.8);
                }

                .search-input:focus {
                    background-color: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.3);
                    outline: none;
                }

                .search-icon {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.8);
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .action-button {
                    position: relative;
                    background: none;
                    border: none;
                    color: white;
                    padding: 0.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .action-button:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }

                .notification-badge,
                .cart-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                }

                .profile-dropdown {
                    position: relative;
                }

                .profile-trigger {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .profile-trigger:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }

                .profile-image {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #15803d;
                }

                .profile-info {
                    display: flex;
                    flex-direction: column;
                }

                .profile-name {
                    font-weight: 600;
                    color: white;
                    font-size: 0.875rem;
                }

                .profile-email {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.75rem;
                }

                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.5rem;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                    min-width: 200px;
                    padding: 0.5rem;
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: #374151;
                    background: none;
                    border: none;
                    width: 100%;
                    text-align: left;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .dropdown-item:hover {
                    background-color: #f3f4f6;
                }

                .dropdown-item.text-danger {
                    color: #dc2626;
                }

                .dropdown-item.text-danger:hover {
                    background-color: #fef2f2;
                }

                @media (max-width: 768px) {
                    .dashboard-header {
                        padding: 1rem;
                    }

                    .menu-toggle {
                        display: flex;
                    }

                    .header-center {
                        display: none;
                    }

                    .profile-info {
                        display: none;
                    }

                    .header-actions {
                        gap: 0.5rem;
                    }
                }
            `}</style>
        </header>
    );
};

export default Header;
