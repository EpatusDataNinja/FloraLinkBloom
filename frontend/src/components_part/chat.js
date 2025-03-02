import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from './user.png';
const fetchUsers = async (token, role) => {
  const response = await fetch('http://localhost:7000/api/v1/users', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': '*/*'
    }
  });

  const data = await response.json();
  if (data.success) {
    return data.users.filter(user => user.role !== role);  // Filter users based on role
  }

  return [];
};

const fetchMessages = async (token, receiverId) => {
  const response = await fetch(`http://localhost:7000/api/v1/message/${receiverId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': '*/*'
    }
  });

  const data = await response.json();
  return data.success ? data.data : [];
};

const sendMessage = async (token, receiverId, message) => {
  const response = await fetch(`http://localhost:7000/api/v1/message/add/${receiverId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'accept': '*/*'
    },
    body: JSON.stringify({ message })
  });

  const data = await response.json();
  return data.success ? data.Message : null;
};

// Function to display time in 'x minutes ago' format
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

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');  // Store selected user's name
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user')); // Get logged-in user from localStorage
  const token = localStorage.getItem('token'); // Get auth token from localStorage

  useEffect(() => {
    if (user && token) {
      const loadUsers = async () => {
        const fetchedUsers = await fetchUsers(token, user.role);
        setUsers(fetchedUsers);
        setLoading(false);
      };

      loadUsers();
    }
  }, [user, token]);

  const handleUserSelect = async (receiverId, firstName, lastName) => {
    setSelectedUser(receiverId);
    setSelectedUserName(`${firstName} ${lastName}`);  // Set selected user's name
    const userMessages = await fetchMessages(token, receiverId);
    setMessages(userMessages);
  };

  const handleMessageSend = async () => {
    if (selectedUser && messageInput.trim() !== '') {
      const newMessage = await sendMessage(token, selectedUser, messageInput);
      if (newMessage) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setMessageInput(''); // Clear the input field
      }
    }
  };

  // Check if user is logged in
  if (!user || !token) {
    return <p>Please log in first.</p>;
  }

  return (
    <div className="container my-4">
      <div className="row">
        {/* User List */}
        <div className="col-md-3">
          <h2>User List</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            users.length > 0 ? (
              <ul className="list-group">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="list-group-item d-flex align-items-center"
                    onClick={() => handleUserSelect(user.id, user.firstname, user.lastname)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={user.image || Image }
                      alt={user.firstname}
                      className="rounded-circle"
                      width="40"
                      height="40"
                    />
                    <span className="ml-2 m-2">{user.firstname} {user.lastname}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No users available.</p>
            )
          )}
        </div>
     

        {/* Chat Box */}
        {selectedUser && (
          <>
             <br/>
          <div className="col-md-9">
            <div className="card shadow-sm rounded-lg">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                 
                  <h5 className="ml-2 mb-0">Chat with {selectedUserName}</h5> {/* Dynamic Chat Header */}
                </div>
                <button className="btn btn-outline-secondary btn-sm">End Chat</button>
              </div>
              <div className="card-body p-4">
                <div className="messages-container" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`message col-12 mb-3 d-flex justify-content-${msg.sender?.id === user.id ? 'end' : 'start'}`}
                      >
                        <div
                      
                          className={`p-1  rounded-lg ${msg.sender?.id === user.id ? 'bg-primary text-white' : 'bg-light'}`}
                          style={{ display: 'flex', alignItems: 'center', maxWidth: '70%',borderRadius:'0.2cm'}}
                        >
                          {/* Display sender's avatar */}
                          <img
                            src={msg.sender?.image || Image}
                            alt={msg.sender?.firstname}
                            className="rounded-circle m-2"
                            width="40"
                            height="40"
                          />
                          <div>
                            <p className="mb-0">{msg.message}</p>
                            <small className="text-muted">{formatTimeAgo(msg.createdAt)}</small>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No messages yet.</p>
                  )}
                </div>

                <div className="input-group mt-3">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="form-control"
                    placeholder="Type a message..."
                    rows="3"
                    style={{ borderRadius: '10px' }}
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-primary"
                      onClick={handleMessageSend}
                      style={{ borderRadius: '6px' }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </> )}
      </div>
    </div>
  );
};

export default Chat;
