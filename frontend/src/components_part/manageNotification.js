import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBell, FaTrash } from 'react-icons/fa';
import { Badge, Button, ListGroup, Card } from 'react-bootstrap';
import { toast } from "react-toastify";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/notification`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
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
        <Card.Header style={{backgroundColor:'lightgreen'}}>
          <h4>
            <FaBell /> Notifications{' '}
            {notifications.length > 0 && (
              <Badge pill bg="danger" className="ms-2">
                {notifications.length} Notifications
              </Badge>
            )}
          </h4>
        </Card.Header>
        <Card.Body>
          {notifications.length === 0 ? (
            <p>No new notifications.</p>
          ) : (
          
            <ListGroup>
              {notifications.map((notification) => (
                <ListGroup.Item
                  key={notification.id}
                  className="d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor: notification.isRead ? "#f8f9fa" : "#ffe5e5", // Light red for unread
                    color: "black",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "8px",
                    boxShadow: notification.isRead ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <FaBell style={{ color: "#dc3545" }} /> {/* Bell icon */}
                    <div>
                      <strong>{notification.title}</strong>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
                        {notification.message}
                      </p>
                      <small className="text-muted" style={{backgroundColor:'white',border:'1px solid gray',padding:'4px',borderRadius:'5px'}}>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </small>
                    </div>
                  </div>
                  <div>
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        // variant="success"
                        className="me-2"
                        onClick={() => markAsRead(notification.id)}
                        style={{ border: '1px solid green', backgroundColor: 'white', color: 'green',margonTop:'-1cm' }}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            
          
          )}
        </Card.Body>
        <Card.Footer className="d-flex justify-content-between" style={{backgroundColor:'lightgreen'}}>
          <Button variant="" 
          onClick={markAllAsRead} 
          style={{ border: '1px solid green', backgroundColor: 'white', color: 'green',margonTop:'0cm' }}
          disabled={notifications.length === 0}>
            Mark All as Read
          </Button>
          <Button 
           style={{ border: '1px solid red', backgroundColor: 'white', color: 'red',margonTop:'0cm' }}
          onClick={deleteAllNotifications} disabled={notifications.length === 0}>
            Delete All
          </Button>
        </Card.Footer>
      </Card>
           <ToastContainer />
    </div>
  );
};

export default Notifications;
