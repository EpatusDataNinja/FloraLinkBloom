import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import {useNavigate } from 'react-router-dom';
import Title from "./TitleCard";
const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem('token');
   const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/v1/users/activate/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      setError('Failed to activate user');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/v1/users/deactivate/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      setError('Failed to deactivate user');
    }
  };

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleViewProducts = (id) => {
    // Redirect or fetch products logic here
    // /
    navigate(`../dashboard/user-products/${id}`);
    console.log(`Viewing products for seller ID: ${id}`);
  };

  const filteredUsers = users.filter(user =>
    user.firstname.toLowerCase().includes(search.toLowerCase()) ||
    user.lastname.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="container mt-4">
       <Title title={'List of users'}/>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Control
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id} style={{ cursor: 'pointer' }}
              onClick={() => handleShowModal(user)}>
                <td>{user.id}</td>
                <td >{user.firstname} {user.lastname}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td className={user.status === 'active' ? 'text-success' : 'text-danger'}>{user.status}</td>
                <td>
                  {user.status === 'inactive' ? (
                    <Button variant="success" size="sm" onClick={() => handleActivate(user.id)}>Activate</Button>
                  ) : (
                    <Button variant="danger" size="sm" onClick={() => handleDeactivate(user.id)}>Deactivate</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <div className="d-flex justify-content-center">
        <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
        <span className="mx-2">Page {currentPage}</span>
        <Button onClick={() => setCurrentPage(prev => prev + 1)} disabled={indexOfLastUser >= filteredUsers.length}>Next</Button>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {selectedUser && (
  <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg p-6">
    <div className="text-center p-2">
      {selectedUser.image && (
        <img
          src={selectedUser.image}
          alt="User"
          className="w-24 h-24 mx-auto rounded-full object-cover mb-4"
        />
      )}
      <h2 className="text-xl font-semibold mb-2">
        {selectedUser.firstname} {selectedUser.lastname}
      </h2>
      {/* <p className="text-gray-500 mb-4">
        <strong>ID:</strong> {selectedUser.id}
      </p> */}
      <p className="text-gray-500 mb-4">
        <strong>Email:</strong> {selectedUser.email}
      </p>
      <p className="text-gray-500 mb-4">
        <strong>Phone:</strong> {selectedUser.phone}
      </p>
      <p className="text-gray-500 mb-4">
        <strong>Role:</strong> {selectedUser.role}
      </p>
      <p className="text-gray-500 mb-4">
        <strong>Address:</strong> {selectedUser.address}
      </p>
      <p className="text-gray-500 mb-4">
        <strong>Status:</strong> {selectedUser.status}
      </p>

      {selectedUser.role === 'seller' && (
        <Button
          variant="primary"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={() => handleViewProducts(selectedUser.id)}
        >
          View Products
        </Button>
      )}
    </div>
  </div>
)}

        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UsersTable;
