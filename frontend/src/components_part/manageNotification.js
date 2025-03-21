import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBell, FaTrash, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaBox, FaShoppingCart } from 'react-icons/fa';
import { Badge, Button, ListGroup, Card, Spinner } from 'react-bootstrap';
import { toast } from "react-toastify";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDistanceToNow } from "date-fns";

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'NEW_PRODUCT':
      return <FaBox className="text-primary" />;
    case 'PRODUCT_APPROVED':
      return <FaCheckCircle className="text-success" />;
    case 'PRODUCT_REJECTED':
      return <FaTimesCircle className="text-danger" />;
    case 'LOW_STOCK':
      return <FaExclamationTriangle className="text-warning" />;
    case 'OUT_OF_STOCK':
      return <FaExclamationTriangle className="text-danger" />;
    case 'ORDER_PLACED':
      return <FaShoppingCart className="text-info" />;
    default:
      return <FaBell className="text-secondary" />;
  }
};

const NotificationBadge = ({ type }) => {
  let badgeProps = {
    bg: 'secondary',
    text: 'Notification'
  };

  switch (type) {
    case 'NEW_PRODUCT':
      badgeProps = { bg: 'primary', text: 'New Product' };
      break;
    case 'PRODUCT_APPROVED':
      badgeProps = { bg: 'success', text: 'Approved' };
      break;
    case 'PRODUCT_REJECTED':
      badgeProps = { bg: 'danger', text: 'Rejected' };
      break;
    case 'LOW_STOCK':
      badgeProps = { bg: 'warning', text: 'Low Stock' };
      break;
    case 'OUT_OF_STOCK':
      badgeProps = { bg: 'danger', text: 'Out of Stock' };
      break;
    case 'ORDER_PLACED':
      badgeProps = { bg: 'info', text: 'New Order' };
      break;
  }

  return (
    <Badge bg={badgeProps.bg} className="ms-2">
      {badgeProps.text}
    </Badge>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications
    const pollInterval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(pollInterval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/notification`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setNotifications(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Handle navigation based on notification type
    if (notification.relatedId) {
      switch (notification.type) {
        case 'NEW_PRODUCT':
          window.location.href = `/admin/products/pending/${notification.relatedId}`;
          break;
        case 'LOW_STOCK':
        case 'OUT_OF_STOCK':
          window.location.href = `/seller/products/${notification.relatedId}`;
          break;
        case 'ORDER_PLACED':
          window.location.href = `/orders/${notification.relatedId}`;
          break;
        default:
          // Handle other notification types as needed
          break;
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/v1/notification/read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      // toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/v1/notification/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/v1/notification/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      // toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/v1/notification/delete-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      toast.success('All notifications deleted');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Failed to delete all notifications');
    }
  };

  return (
    <div className="container mt-4">
      <Card>
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <FaBell className="me-2" /> Notifications
              {notifications.length > 0 && (
                <Badge pill bg="danger" className="ms-2">
                  {notifications.length}
                </Badge>
              )}
            </h4>
            {notifications.length > 0 && (
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={markAllAsRead}
                >
                  Mark All as Read
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={deleteAllNotifications}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-muted p-4">
              <FaBell size={40} className="mb-3" />
              <p>No notifications to display</p>
            </div>
          ) : (
            <ListGroup>
              {notifications.map((notification) => (
                <ListGroup.Item
                  key={notification.id}
                  className={`d-flex align-items-start p-3 ${
                    !notification.isRead ? 'bg-light' : ''
                  }`}
                >
                  <div 
                    className="d-flex flex-grow-1 align-items-start"
                    role="button"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="me-3">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-1">
                          {notification.title}
                          <NotificationBadge type={notification.type} />
                        </h6>
                        <small className="text-muted">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </small>
                      </div>
                      <p className="mb-1">{notification.message}</p>
                      {!notification.isRead && (
                        <Badge bg="info" pill>
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="ms-2 text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <FaTrash />
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default Notifications;
