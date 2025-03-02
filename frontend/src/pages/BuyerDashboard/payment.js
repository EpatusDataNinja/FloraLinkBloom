import { useEffect, useState } from "react";
import { Table, Button, Modal, Spinner, Form } from "react-bootstrap";
import moment from "moment";
import Title from "../../components_part/TitleCard";
const PaymentsTable = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/payment`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          setPayments(result.data);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [token]);

  const filteredPayments = payments
    .filter((payment) => (filterStatus ? payment.status === filterStatus : true))
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container mt-5">
            <Title title={'Payments'}/>

      {/* Filters and Sorting */}
      <div className="d-flex justify-content-between mb-3">
        <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </Form.Select>
        <Form.Select value={sortField} onChange={(e) => setSortField(e.target.value)}>
          <option value="createdAt">Date</option>
          <option value="amount">Amount</option>
          <option value="payer.firstname">Payer Name</option>
        </Form.Select>
        <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </Form.Select>
      </div>

      {/* Table */}
      <Table striped bordered hover responsive>
        <thead className="bg-light">
          <tr>
            <th>ID</th>
            <th>Payer</th>
            <th>Order ID</th>
            <th>Amount ($)</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Product</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPayments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.id}</td>
              <td>{payment.payer.firstname} {payment.payer.lastname} ({payment.payer.email})</td>
              <td>{payment.orderID}</td>
              <td>{payment.amount}</td>
              <td>{payment.paymentMethod}</td>
              <td className={payment.status === "paid" ? "text-success" : "text-danger"}>{payment.status}</td>
              <td>{payment.order?.product?.name}</td>
              <td>{moment(payment.createdAt).format("YYYY-MM-DD HH:mm")}</td>
              <td>
                <Button variant="primary" onClick={() => {
                  setSelectedPayment(payment);
                  setShowModal(true);
                }}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex justify-content-center">
        <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</Button>
        <span className="mx-3">Page {currentPage} of {totalPages}</span>
        <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
      </div>
          
      {/* Payment Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <>
              <p><strong>ID:</strong> {selectedPayment.id}</p>
              <p><strong>Payer:</strong> {selectedPayment.payer.firstname} {selectedPayment.payer.lastname} ({selectedPayment.payer.email})</p>
              <p><strong>Order ID:</strong> {selectedPayment.orderID}</p>
              <p><strong>Amount:</strong> ${selectedPayment.amount}</p>
              <p><strong>Payment Method:</strong> {selectedPayment.paymentMethod}</p>
              <p><strong>Status:</strong> {selectedPayment.status}</p>
              <p><strong>Product:</strong> {selectedPayment.order?.product?.name}</p>
              <p><strong>Created At:</strong> {moment(selectedPayment.createdAt).format("YYYY-MM-DD HH:mm")}</p>
              {selectedPayment.order?.product?.image && (
                <img
                  src={selectedPayment.order.product.image}
                  alt={selectedPayment.order.product.name}
                  className="img-fluid rounded mt-2"
                />
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentsTable;
