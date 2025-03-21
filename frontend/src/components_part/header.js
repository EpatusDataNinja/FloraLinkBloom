import { FaBell, FaUser, FaCog, FaSignOutAlt, FaEnvelope, FaShoppingCart, FaSearch } from "react-icons/fa";
import Badge from "react-bootstrap/Badge";
import { useNavigate, Link, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import Image from './user.png'
import Title from "../components_part/TitleCard";
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import io from 'socket.io-client';
import SearchSuggestions from '../components/SearchSuggestions';

const Header = ({ setShow }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [showMessagePreview, setShowMessagePreview] = useState(false);
    const [unreadMessagesList, setUnreadMessagesList] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const [searchTerm, setSearchTerm] = useState('');
    const searchContainerRef = useRef(null);

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

    useEffect(() => {
        if (!token) return;

        let socket;
        const initializeSocket = async () => {
            try {
                await fetchUnreadMessages();

                socket = io(process.env.REACT_APP_BASE_URL, {
                    auth: { token }
                });

                socket.on('messagesRead', () => {
                    fetchUnreadMessages(); // Refresh unread count
                });

                socket.on('newMessage', () => {
                    fetchUnreadMessages();
                });

            } catch (error) {
                console.error('Error initializing socket:', error);
            }
        };

        initializeSocket();
        const interval = setInterval(fetchUnreadMessages, 30000);

        return () => {
            clearInterval(interval);
            if (socket) socket.disconnect();
        };
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    const fetchNotifications = async () => {
        if (!localStorage.getItem('token')) return;
        
        setIsLoadingNotifications(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/v1/notification`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.data.success) {
                setNotifications(response.data.data || []);
                setUnreadCount(response.data.data.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    const fetchUnreadMessages = async () => {
        if (!token) return;
        
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/v1/message/unread`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setUnreadMessages(data.messages.length);
                setUnreadMessagesList(data.messages);
            }
        } catch (error) {
            console.error('Error fetching unread messages:', error);
            setUnreadMessages(0);
            setUnreadMessagesList([]);
        }
    };

    const handleMessageClick = (message) => {
        setShowMessagePreview(false);
        navigate('/chat', { 
            state: { 
                selectedUserId: message.sender.id,
                selectedUserName: `${message.sender.firstname} ${message.sender.lastname}`
            }
        });
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

            <div className="header-center" ref={searchContainerRef}>
                <div style={{ 
                    position: 'relative', 
                    width: '400px',
                    zIndex: 1001,
                    margin: '0 auto'
                }}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (searchTerm.trim()) {
                            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                            setSearchTerm('');
                        }
                    }} className="search-container">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            name="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Search in ${capitalizeRole(user?.role)} Dashboard...`}
                            style={{ 
                                width: '100%',
                                padding: '0.5rem 1rem 0.5rem 2.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                transition: 'all 0.3s ease',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white'
                            }}
                        />
                    </form>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <SearchSuggestions 
                            searchTerm={searchTerm} 
                            onSelect={() => setSearchTerm('')}
                        />
                    </div>
                </div>
            </div>

            <div className="header-right">
                <div className="header-actions">
                    <div className="message-dropdown">
                        <div className="message-trigger" onClick={() => setShowMessagePreview(!showMessagePreview)}>
                            <FaEnvelope className="message-icon" />
                            {unreadMessages > 0 && (
                                <Badge pill bg="danger" className="message-badge">
                                    {unreadMessages}
                                </Badge>
                            )}
                        </div>
                        {showMessagePreview && (
                            <div className="message-preview-dropdown">
                                <div className="preview-header">
                                    <h6 className="preview-title">Unread Messages</h6>
                                </div>
                                <div className="preview-list">
                                    {unreadMessagesList.length > 0 ? (
                                        unreadMessagesList.map((msg) => (
                                            <div 
                                                key={msg.id} 
                                                className="message-preview-item"
                                                onClick={() => handleMessageClick(msg)}
                                            >
                                                <div className="message-sender">
                                                    {msg.sender.firstname} {msg.sender.lastname}
                                                </div>
                                                <div className="message-content">
                                                    {msg.message}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-messages">
                                            No new messages
                                        </div>
                                    )}
                                </div>
                                <div className="preview-footer">
                                    <button 
                                        className="view-all-link"
                                        onClick={() => {
                                            setShowMessagePreview(false);
                                            navigate('/chat');
                                        }}
                                    >
                                        View All Messages
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <Link to="/notifications" className="action-button notification-button">
                        <FaBell />
                        {isLoadingNotifications ? (
                            <Spinner animation="border" size="sm" />
                        ) : unreadCount > 0 && (
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

                .message-dropdown {
                    position: relative;
                    display: inline-block;
                }

                .message-trigger {
                    cursor: pointer;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    color: white;
                }

                .message-icon {
                    font-size: 1.2rem;
                }

                .message-preview-dropdown {
                    position: absolute;
                    top: calc(100% + 10px);
                    right: -10px;
                    width: 300px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                }

                .preview-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid #e0e0e0;
                }

                .preview-title {
                    margin: 0;
                    color: #333;
                    font-size: 14px;
                    font-weight: 600;
                }

                .preview-list {
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 8px 0;
                }

                .no-messages {
                    padding: 16px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }

                .preview-footer {
                    padding: 12px 16px;
                    border-top: 1px solid #e0e0e0;
                    text-align: center;
                }

                .view-all-link {
                    color: #15803d;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                }

                .view-all-link:hover {
                    text-decoration: underline;
                    color: #166534;
                }
            `}</style>
        </header>
    );
};

export default Header;
