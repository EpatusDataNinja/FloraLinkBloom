import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from './user.png';
import Title from "./TitleCard";
import LoadingSpinner from './loading';
import { Badge } from 'react-bootstrap';
import '../css/Chat.css';
import { FaFile, FaImage, FaVideo, FaVolumeUp, FaPaperclip } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const fetchUsers = async (token, role) => {
  const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': '*/*'
    }
  });

  const data = await response.json();
  if (data.success) {
    return data.users.filter(user => user.role !== role);
  }
  return [];
};

const sendMessage = async (token, receiverId, messageData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/message/add/${receiverId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify({ 
        message: messageData.message,
        replyTo: messageData.replyTo 
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to send message');
    }
    return data.Message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / (3600 * 24));

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const validateImageUrl = (imageUrl, defaultImage) => {
  if (!imageUrl || imageUrl === 'undefined' || imageUrl === 'null') {
    return defaultImage;
  }
  return imageUrl;
};

const isMessageDuplicate = (messages, newMessage) => {
  return messages.some(msg => 
    msg.id === newMessage.id || 
    (msg.message === newMessage.message && 
     msg.senderId === newMessage.senderId && 
     msg.createdAt === newMessage.createdAt)
  );
};

const MessageStatus = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
};

const MessageActions = ({ message, onReply, onDelete, onClose }) => {
  return (
    <div className="message-menu">
      <button onClick={() => {
        onReply(message);
        onClose();
      }}>
        Reply
      </button>
      <button onClick={() => {
        onDelete(message.id);
        onClose();
      }}>
        Delete
      </button>
    </div>
  );
};

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadMessages, setUnreadMessages] = useState({});
  const [typing, setTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [messageStatuses, setMessageStatuses] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [lastActiveTime, setLastActiveTime] = useState({});
  const onlineStatusRef = useRef({});
  
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const updateOnlineStatus = (userId, status) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (status) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });

    if (!status) {
      setLastActiveTime(prev => ({
        ...prev,
        [userId]: new Date().toISOString()
      }));
    }
  };

  const fetchMessages = async (token, receiverId) => {
    if (!token || !receiverId) return [];
    
    try {
      console.log('Fetching messages for receiver:', receiverId);
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/v1/message/${receiverId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched messages:', data);
      
      if (data.success) {
        return data.data.map(msg => ({
          ...msg,
          status: msg.isRead ? MessageStatus.READ : 
                  (msg.isDelivered ? MessageStatus.DELIVERED : MessageStatus.SENT)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error.message || 'Failed to load messages. Please try again.');
      return [];
    }
  };

  useEffect(() => {
    if (!token || !user) {
      setError('Please log in to access chat');
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching users...');
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        console.log('Fetched users data:', data);
        
        if (data.success) {
          // Filter users based on role and current user
          const filteredUsers = data.users.filter(u => 
            u.role !== 'admin' && 
            u.id !== user?.id &&
            (user?.role === 'buyer' ? u.role === 'seller' : 
             user?.role === 'seller' ? u.role === 'buyer' : true)
          );
          console.log('Filtered users:', filteredUsers);
          setUsers(filteredUsers);
        } else {
          throw new Error(data.message || 'Failed to fetch users');
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [token, user?.id, user?.role]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(token, selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!token) return;

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;
    const statusUpdateTimeout = {};

    try {
      socketRef.current = io(process.env.REACT_APP_BASE_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: reconnectDelay,
        timeout: 10000,
        transports: ['websocket', 'polling'],
        forceNew: true,
        path: '/socket.io/'
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to socket server');
        setIsOnline(true);
        reconnectAttempts = 0;
        setError(null);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsOnline(false);
        setError('Connection error. Please check your internet connection.');
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsOnline(false);
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          socketRef.current.connect();
        }
      });

      socketRef.current.on('reconnect_attempt', (attemptNumber) => {
        console.log('Attempting to reconnect:', attemptNumber);
        reconnectAttempts = attemptNumber;
      });

      socketRef.current.on('reconnect_failed', () => {
        console.error('Failed to reconnect after', maxReconnectAttempts, 'attempts');
        setError('Connection lost. Please refresh the page.');
      });

      socketRef.current.on('userOnline', (userId) => {
        // Clear any pending offline status update
        if (statusUpdateTimeout[userId]) {
          clearTimeout(statusUpdateTimeout[userId]);
        }
        updateOnlineStatus(userId, true);
      });

      socketRef.current.on('userOffline', (userId) => {
        // Add a small delay before marking user as offline to prevent flickering
        statusUpdateTimeout[userId] = setTimeout(() => {
          updateOnlineStatus(userId, false);
        }, 2000);
      });

      socketRef.current.on('lastActive', ({ userId, timestamp }) => {
        setLastActiveTime(prev => ({
          ...prev,
          [userId]: timestamp
        }));
      });

      socketRef.current.on('typing', ({ senderId }) => {
        if (selectedUser?.id === senderId) {
          setTyping(true);
          setTimeout(() => setTyping(false), 3000);
        }
      });

      socketRef.current.on('messageRead', ({ messageId }) => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ));
      });

      socketRef.current.on('newMessage', (message) => {
        console.log('Received new message:', message);
        setMessages(prev => {
          if (isMessageDuplicate(prev, message)) {
            return prev;
          }
          return [...prev, message];
        });

        if (selectedUser?.id === message.senderId) {
          socketRef.current.emit('messageRead', {
            messageId: message.id,
            senderId: message.senderId
          });
        }
      });

      socketRef.current.on('messageSent', (message) => {
        console.log('Message sent confirmation:', message);
        setMessages(prev => {
          if (isMessageDuplicate(prev, message)) {
            return prev;
          }
          return [...prev, message];
        });
      });

      socketRef.current.on('messageError', (error) => {
        console.error('Message error:', error);
        setError('Error sending message. Please try again.');
      });

      socketRef.current.on('messageDelivered', ({ messageId }) => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: MessageStatus.DELIVERED }
            : msg
        ));
      });

      socketRef.current.on('messageRead', ({ messageId }) => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: MessageStatus.READ }
            : msg
        ));
      });

      socketRef.current.on('chatHistoryUpdate', async ({ userId }) => {
        if (userId === user.id) {
          try {
            const response = await fetch(
              `${process.env.REACT_APP_BASE_URL}/api/v1/message/history`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'accept': '*/*'
                }
              }
            );

            const data = await response.json();
            if (data.success) {
              setChatHistory(data.data);
            } else {
              console.error('Failed to update chat history:', data.message);
              setError('Failed to update chat history. Please refresh the page.');
            }
          } catch (error) {
            console.error('Error updating chat history:', error);
            setError('Error updating chat history. Please try again.');
          }
        }
      });

      socketRef.current.on('heartbeat', () => {
        socketRef.current.emit('heartbeat-ack');
      });

      const heartbeat = setInterval(() => {
        if (socketRef.current.connected) {
          socketRef.current.emit('heartbeat');
        }
      }, 30000);

      return () => {
        Object.values(statusUpdateTimeout).forEach(clearTimeout);
        clearInterval(heartbeat);
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Socket initialization error:', error);
      setError('Failed to connect to chat server');
    }
  }, [token]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!token) return;
      
      try {
        setLoadingHistory(true);
        console.log('Fetching chat history...');
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/v1/message/history`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'accept': '*/*'
            }
          }
        );

        const data = await response.json();
        console.log('Chat history response:', data);
        
        if (data.success) {
          // Ensure we're setting the chat history with the correct data structure
          const formattedHistory = data.data.map(chat => ({
            lastMessage: chat.lastMessage,
            unreadCount: chat.unreadCount,
            otherUser: chat.otherUser,
            totalMessages: chat.totalMessages
          }));
          console.log('Formatted chat history:', formattedHistory);
          setChatHistory(formattedHistory);
        } else {
          console.error('Failed to fetch chat history:', data.message);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [token]);

  useEffect(() => {
    if (location.state?.selectedUserId) {
      const selectedUser = users.find(user => user.id === location.state.selectedUserId);
      if (selectedUser) {
        handleUserSelect(selectedUser);
        // Clear the navigation state
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state, users]);

  if (error) {
    return (
      <div className="chat-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleUserSelect = async (selectedUser) => {
    try {
      console.log('Selecting user:', selectedUser);
      setSelectedUser(selectedUser);
      setSelectedUserName(`${selectedUser.firstname} ${selectedUser.lastname}`);
      setMessages([]); // Clear existing messages
      
      const messages = await fetchMessages(token, selectedUser.id);
      console.log('Loaded messages:', messages);
      
      if (messages && messages.length > 0) {
        setMessages(messages);
        
        // Mark messages as read
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && !lastMessage.isRead) {
          socketRef.current.emit('messageRead', {
            messageId: lastMessage.id,
            senderId: selectedUser.id
          });
        }
      } else {
        setMessages([]); // Set empty array if no messages
      }

      // Update chat history to reflect read status
      setChatHistory(prev => prev.map(chat => 
        chat.otherUser.id === selectedUser.id 
          ? { ...chat, unreadCount: 0 }
          : chat
      ));
    } catch (error) {
      console.error('Error in handleUserSelect:', error);
      setError('Failed to load chat. Please try again.');
      setMessages([]); // Clear messages on error
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setMessageInput('');
    document.querySelector('.message-input').focus();
  };

  const handleMessageSend = async () => {
    if (!selectedUser || !messageInput.trim()) return;

    try {
      const messageData = {
        message: messageInput,
        replyTo: replyingTo?.id
      };

      const newMessage = await sendMessage(token, selectedUser.id, messageData);
      
      setMessages(prev => [...prev, {
        ...newMessage,
        status: MessageStatus.SENT,
        senderId: user.id,
        receiverId: selectedUser.id,
        createdAt: new Date().toISOString(),
        replyTo: replyingTo?.id
      }]);
      
      setMessageInput('');
      setReplyingTo(null);

      socketRef.current.emit('sendMessage', {
        receiverId: selectedUser.id,
        senderId: user.id,
        message: newMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleMessageSend();
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleMediaUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('media', selectedFile);
    formData.append('message', messageInput);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/v1/message/upload/${selectedUser.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.Message]);
        setSelectedFile(null);
        setMessageInput('');
        
        socketRef.current.emit('sendMedia', {
          receiverId: selectedUser.id,
          message: data.Message
        });
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      setError('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const uniqueMessages = Array.from(new Map(
    messages.map(msg => [msg.id, msg])
  ).values());

  const renderMessageStatus = (message) => {
    if (message.senderId !== user.id) return null;
    
    switch (message.status) {
      case MessageStatus.READ:
        return <span className="message-status read">✓✓</span>;
      case MessageStatus.DELIVERED:
        return <span className="message-status delivered">✓✓</span>;
      case MessageStatus.SENT:
      default:
        return <span className="message-status sent">✓</span>;
    }
  };

  const renderMediaMessage = (message) => {
    switch (message.mediaType) {
      case 'image':
        return (
          <img 
            src={process.env.REACT_APP_BASE_URL + message.mediaUrl} 
            alt="Shared image" 
            className="media-preview"
          />
        );
      case 'video':
        return (
          <video controls className="media-preview">
            <source src={process.env.REACT_APP_BASE_URL + message.mediaUrl} />
          </video>
        );
      case 'audio':
        return (
          <audio controls>
            <source src={process.env.REACT_APP_BASE_URL + message.mediaUrl} />
          </audio>
        );
      case 'document':
        return (
          <a 
            href={process.env.REACT_APP_BASE_URL + message.mediaUrl} 
            download={message.fileName}
            className="document-link"
          >
            <FaFile /> {message.fileName}
          </a>
        );
      default:
        return <p>{message.message}</p>;
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/v1/message/search/${query}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.messages);
      }
    } catch (error) {
      console.error('Error searching messages:', error);
      setError('Failed to search messages');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteClick = async (messageId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/v1/message/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
    }
  };

  const getLastActiveText = (userId) => {
    if (onlineUsers.has(userId)) return 'Online';
    
    const lastActive = lastActiveTime[userId];
    if (!lastActive) return 'Offline';
    
    return `Last seen ${formatTimeAgo(lastActive)}`;
  };

  return (
    <div className="chat-container">
        <div className="user-list">
            <div className="user-list-header">
                <div className="current-user">
                    <img 
                        src={validateImageUrl(user?.image, Image)} 
                        alt="profile" 
                        className="user-avatar-img"
                    />
                    <h3>Messages</h3>
                </div>
                <div className="search-box">
                    <input type="text" placeholder="Search chats..." />
                </div>
            </div>

            <div className="users-container">
              {loadingHistory ? (
                <LoadingSpinner />
              ) : (
                <>
                  {/* Chat History Section */}
                  <div className="chat-section">
                    <h4 className="section-title">Recent Chats</h4>
                    {chatHistory && chatHistory.length > 0 ? (
                      chatHistory.map((chat, index) => {
                        const uniqueKey = `${chat.otherUser.id}-${index}`;
                        return (
                          <div
                            key={uniqueKey}
                            className={`user-item ${
                              selectedUser?.id === chat.otherUser.id ? 'active' : ''
                            } ${chat.unreadCount > 0 ? 'unread' : ''}`}
                            onClick={() => handleUserSelect(chat.otherUser)}
                          >
                            <div className="user-avatar">
                              <img
                                src={validateImageUrl(chat.otherUser.image, Image)}
                                alt={chat.otherUser.firstname}
                                className="user-avatar-img"
                              />
                              <span className={`status-indicator ${
                                onlineUsers.has(chat.otherUser.id) ? 'online' : 'offline'
                              }`}></span>
                            </div>
                            <div className="user-info">
                              <div className="user-header">
                                <h4 className="user-name">
                                  {`${chat.otherUser.firstname} ${chat.otherUser.lastname}`}
                                </h4>
                                <span className="message-time">
                                  {formatTimeAgo(chat.lastMessage.createdAt)}
                                </span>
                              </div>
                              <div className="message-preview">
                                <p className="last-message">
                                  {chat.lastMessage.mediaType !== 'text' ? 
                                    `Sent ${chat.lastMessage.mediaType}` : 
                                    chat.lastMessage.message.substring(0, 30)}
                                  {chat.lastMessage.message.length > 30 ? '...' : ''}
                                </p>
                                {chat.unreadCount > 0 && (
                                  <span className="unread-badge">{chat.unreadCount}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-chats">
                        <p>No conversations yet</p>
                      </div>
                    )}
                  </div>

                  {/* Available Users Section */}
                  <div className="chat-section">
                    <h4 className="section-title">
                      {user?.role === 'buyer' ? 'Available Sellers' : 'Available Buyers'}
                    </h4>
                    {users && users.length > 0 ? (
                      users.map((user) => (
                        <div
                          key={user.id}
                          className={`user-item ${
                            selectedUser?.id === user.id ? 'active' : ''
                          }`}
                          onClick={() => handleUserSelect(user)}
                        >
                          <div className="user-avatar">
                            <img
                              src={validateImageUrl(user.image, Image)}
                              alt={user.firstname}
                              className="user-avatar-img"
                            />
                            <span className={`status-indicator ${
                              onlineUsers.has(user.id) ? 'online' : 'offline'
                            }`}></span>
                          </div>
                          <div className="user-info">
                            <div className="user-header">
                              <h4 className="user-name">
                                {`${user.firstname} ${user.lastname}`}
                              </h4>
                            </div>
                            <div className="message-preview">
                              <p className="user-role">
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-chats">
                        <p>No {user?.role === 'buyer' ? 'sellers' : 'buyers'} available</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
        </div>
     
        <div className="chat-box">
        {selectedUser ? (
                <>
                    <div className="chat-header">
                        <div className="chat-header-user">
                            <img 
                                src={validateImageUrl(selectedUser.image, Image)} 
                                alt={selectedUser.firstname}
                                className="chat-header-avatar"
                            />
                            <div className="chat-header-info">
                                <h4>{selectedUserName}</h4>
                                <p className={onlineUsers.has(selectedUser.id) ? 'online' : 'offline'}>
                                    {getLastActiveText(selectedUser.id)}
                                </p>
                          </div>
                        </div>
                      </div>

                    <div className="messages">
                        {replyingTo && (
                            <div className="reply-banner">
                                <div className="reply-content">
                                    <span>Replying to: {replyingTo.message}</span>
                                    <button onClick={() => setReplyingTo(null)}>×</button>
                                </div>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div
                                key={msg.id || index}
                                className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                            >
                                <div className="message-bubble">
                                    {msg.replyTo && (
                                        <div className="replied-message">
                                            {messages.find(m => m.id === msg.replyTo)?.message}
                                        </div>
                                    )}
                                    <div className="message-content">
                                        {renderMediaMessage(msg)}
                                    </div>
                                    <div className="message-meta">
                                        <span className="message-time">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </span>
                                        {renderMessageStatus(msg)}
                                    </div>
                                </div>
                                {msg.senderId === user.id && (
                                    <div className="message-actions">
                                        <button 
                                            className="message-menu-button"
                                            onClick={() => setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id)}
                                        >
                                            ⋮
                                        </button>
                                        {showMessageMenu === msg.id && (
                                            <div className="message-menu">
                                                <button onClick={() => {
                                                    handleReply(msg);
                                                    setShowMessageMenu(null);
                                                }}>
                                                    Reply
                                                </button>
                                                <button onClick={() => {
                                                    handleDeleteClick(msg.id);
                                                    setShowMessageMenu(null);
                                                }}>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {typing && (
                            <div className="typing-indicator">
                                <span>typing...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="message-input-container">
                        <div className="input-actions">
                            <label className="media-upload-button">
                                <input
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                                    style={{ display: 'none' }}
                                />
                                <FaPaperclip />
                            </label>
                        </div>
                        <input
                            type="text"
                            className="message-input"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                        />
                        {selectedFile && (
                            <div className="selected-file">
                                <span>{selectedFile.name}</span>
                                <button onClick={() => setSelectedFile(null)}>×</button>
                            </div>
                        )}
                        <button
                            className="send-button"
                            onClick={selectedFile ? handleMediaUpload : handleMessageSend}
                            disabled={!messageInput.trim() && !selectedFile}
                        >
                            Send
                        </button>
                    </div>
                </>
            ) : (
                <div className="no-chat-selected">
                    <img 
                        src={Image} 
                        alt="Welcome" 
                        className="welcome-image"
                    />
                    <h2>Welcome to FloraLink Chat</h2>
                    <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;