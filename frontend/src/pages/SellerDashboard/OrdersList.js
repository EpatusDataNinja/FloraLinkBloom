import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Pagination, Spinner, Form, Button, Modal, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Title from "../../components_part/TitleCard";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  
  const token = localStorage.getItem("token");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus, sortField, sortOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/order`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, filterStatus, sortField, sortOrder },
      });

      setOrders(response.data.data);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage) || 1);
    } catch (error) {
      console.error("Error fetching orders", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/v1/order/status/${selectedOrder.id}`,
        { status: updateStatus },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        toast.success("Order status updated successfully!");
        fetchOrders();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error updating order status", error);
      toast.error("Failed to update order status.");
    }
  };

  return (
    <div className="content-wrapper">
      <Title title={'Orders List'}/>
      <div className="orders-content">
        <Form className="mb-3 d-flex gap-3">
          <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </Form.Select>
          <Form.Select value={sortField} onChange={(e) => setSortField(e.target.value)}>
            <option value="createdAt">Date</option>
            <option value="totalAmount">Amount</option>
            <option value="buyer.firstname">Buyer</option>
          </Form.Select>
          <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Form.Select>
        </Form>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Buyer</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No orders available
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.product.name}</td>
                      <td>{order.buyer.firstname} {order.buyer.lastname}</td>
                      <td>{order.quantity}</td>
                      <td>${order.totalAmount}</td>
                      <td>{order.status}</td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        <Button variant="info" size="sm" onClick={() => handleViewOrder(order)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}

        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev onClick={() => setPage(page > 1 ? page - 1 : 1)} />
            {totalPages > 0 &&
              [...Array(totalPages)].map((_, index) => (
                <Pagination.Item key={index} active={index + 1 === page} onClick={() => setPage(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}
            <Pagination.Next onClick={() => setPage(page < totalPages ? page + 1 : totalPages)} />
          </Pagination>
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Order Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <p><strong>Product:</strong> {selectedOrder.product.name}</p>
                <p><strong>Buyer:</strong> {selectedOrder.buyer.firstname} {selectedOrder.buyer.lastname}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                <p><strong>Total Amount:</strong> ${selectedOrder.totalAmount}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Created At:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>

                {selectedOrder.status !== "completed" && (
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Update Status</Form.Label>
                      <Form.Select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </Form.Select>
                    </Form.Group>
                  </Form>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            {selectedOrder && selectedOrder.status !== "completed" && (
              <Button variant="success" onClick={handleUpdateStatus}>Update Status</Button>
            )}
          </Modal.Footer>
        </Modal>
      </div>

      <style jsx="true">{`
        .content-wrapper {
          padding: 20px;
          background: #f8f9fa;
        }

        .orders-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .table-responsive {
          margin-top: 1rem;
          overflow-x: auto;
        }

        @media (max-width: 768px) {
          .content-wrapper {
            padding: 15px;
          }

          .orders-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;
