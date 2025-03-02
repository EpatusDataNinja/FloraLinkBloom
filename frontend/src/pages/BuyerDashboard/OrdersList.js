import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Pagination, Spinner, Container, Form } from "react-bootstrap";
import Title from "../../components_part/TitleCard";
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const token = localStorage.getItem("token");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/order`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { page, filterStatus, sortField, sortOrder },
        });

        const ordersData = response.data.data;
        setOrders(ordersData);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage) || 1); // Ensure totalPages is valid
      } catch (error) {
        console.error("Error fetching orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, filterStatus, sortField, sortOrder]);

  return (
    <Container>
         <Title title={'List of my Orders'}/>
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
        <Spinner animation="border" />
      ) : (
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
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
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
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      <Pagination>
        <Pagination.Prev onClick={() => setPage(page > 1 ? page - 1 : 1)} />
        
        {/* Ensuring the pagination array is only generated when totalPages is valid */}
        {totalPages > 0 && [...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index}
            active={index + 1 === page}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        
        <Pagination.Next
          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
        />
      </Pagination>
    </Container>
  );
};

export default OrdersPage;
