import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Pagination, Spinner, Form } from "react-bootstrap";
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
        setTotalPages(Math.ceil(response.data.total / itemsPerPage) || 1);
      } catch (error) {
        console.error("Error fetching orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, filterStatus, sortField, sortOrder, token]);

  return (
    <div className="orders-section">
      <Title title={'List of my Orders'} />
      <div className="content-section">
        <div className="filters-row mb-4">
          <Form.Select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </Form.Select>
          <Form.Select 
            value={sortField} 
            onChange={(e) => setSortField(e.target.value)}
            className="filter-select"
          >
            <option value="createdAt">Date</option>
            <option value="totalAmount">Amount</option>
            <option value="buyer.firstname">Buyer</option>
          </Form.Select>
          <Form.Select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="filter-select"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Form.Select>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="bg-light">
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
                    <td colSpan="7" className="text-center py-4">
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
                      <td className="text-success">${order.totalAmount}</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="pagination-section mt-4">
            <Pagination>
              <Pagination.Prev 
                onClick={() => setPage(page > 1 ? page - 1 : 1)}
                disabled={page === 1}
              />
              {[...Array(totalPages)].map((_, index) => (
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
                disabled={page === totalPages}
              />
            </Pagination>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .orders-section {
          width: 100%;
        }

        .content-section {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .filters-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-select {
          flex: 1;
          min-width: 200px;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-badge.shipped {
          background-color: #cce5ff;
          color: #004085;
        }

        .status-badge.delivered {
          background-color: #d4edda;
          color: #155724;
        }

        .pagination-section {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .table-responsive {
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .content-section {
            padding: 1rem;
          }

          .filters-row {
            flex-direction: column;
          }

          .filter-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;
