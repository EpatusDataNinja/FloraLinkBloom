import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Pagination, Spinner, Container, Form, Button, Modal } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
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
  const [processing, setProcessing] = useState(false);
  const [refundLoading, setRefundLoading] = useState(null);

  const token = localStorage.getItem("token");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/order`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, filterStatus, sortField, sortOrder },
        });

        let fetchedOrders = response.data.data;
        
        // Apply filter logic
        if (filterStatus) {
          fetchedOrders = fetchedOrders.filter(order => order.status === filterStatus);
        }

        // Apply sorting logic
        fetchedOrders = fetchedOrders.sort((a, b) => {
          if (sortField === "createdAt") {
            return sortOrder === "asc" 
              ? new Date(a.createdAt) - new Date(b.createdAt) 
              : new Date(b.createdAt) - new Date(a.createdAt);
          } else if (sortField === "totalAmount") {
            return sortOrder === "asc" 
              ? a.totalAmount - b.totalAmount 
              : b.totalAmount - a.totalAmount;
          } else if (sortField === "buyer.firstname") {
            const nameA = a.buyer.firstname.toLowerCase();
            const nameB = b.buyer.firstname.toLowerCase();
            return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
          }
          return 0;
        });

        setOrders(fetchedOrders);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage) || 1);
      } catch (error) {
        // toast.error(error.response?.data?.message || "Error fetching orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, filterStatus, sortField, sortOrder]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setShowModal(true);
  };

  const handleRefund = async (orderId) => {
    setRefundLoading(orderId); // Set loading for this specific order

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/v1/order/checkout/${orderId}`,
        {
          money: 12,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Order refunded successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Refund failed.");
    } finally {
      setRefundLoading(null); // Reset loading state
    }
  };

  return (
    <div className="orders-container">
      <Title title={'Orders List'}/>
      <div className="orders-content">
        <Form className="mb-3 d-flex gap-3">
          <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
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
                      <td>{order.totalAmount}</td>
                      <td>{order.status}</td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        <Button variant="info" size="sm" onClick={() => handleViewOrder(order)}>
                          View
                        </Button>{" "}
                        {order.status === "delivered" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRefund(order.id)}
                            disabled={refundLoading === order.id}
                          >
                            {refundLoading === order.id ? <Spinner size="sm" animation="border" /> : "Refund"}
                          </Button>
                        )}
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

        {/* Order Details Modal */}
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
                <p><strong>Total Amount:</strong> {selectedOrder.totalAmount}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
        
        <ToastContainer />
      </div>

      <style jsx="true">{`
        .orders-container {
          width: 100%;
        }

        .orders-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .table-responsive {
          margin-top: 1rem;
          overflow-x: auto;
        }

        @media (max-width: 768px) {
          .orders-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;
