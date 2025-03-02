import React, { useEffect, useState } from "react";
import { Container, Table, Card, Row, Col, Pagination, Button } from "react-bootstrap";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Title from "../../components_part/TitleCard";

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalRefundDeductions, setTotalRefundDeductions] = useState(0);
  const [totalUnpaidOrders, setTotalUnpaidOrders] = useState(0);
  const [totalRefundedOrders, setTotalRefundedOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/users/seller/sales-report`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      });
      const data = response.data;
      setSalesData(data.report);
      setTotalSales(data.totalSales);
      setTotalEarnings(data.totalEarnings);
      setTotalRefundDeductions(data.totalRefundDeductions);
      setTotalUnpaidOrders(data.totalUnpaidOrders);
      setTotalRefundedOrders(data.totalRefundedOrders);
    } catch (error) {
      console.error("Error fetching sales report:", error);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = salesData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salesData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(salesData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, "Sales_Report.xlsx");
  };

  return (
    <Container className="mt-4">
   
      <Title title={'Sales Report'}/>
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow text-center p-3">
            <h5>Total Sales</h5>
            <h3>{totalSales}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow text-center p-3 bg-success text-white">
            <h5>Total Earnings</h5>
            <h3>Rwf{totalEarnings}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow text-center p-3 bg-warning">
            <h5>Refund Deductions</h5>
            <h3>Rwf{totalRefundDeductions}</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow text-center p-3 bg-danger text-white">
            <h5>Unpaid Orders</h5>
            <h3>{totalUnpaidOrders}</h3>
          </Card>
        </Col>
      </Row>

      {/* Sales Table */}
      <Card className="shadow">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <h4>Order Details</h4>
            <Button variant="primary" onClick={exportToExcel}>Export to Excel</Button>
          </div>
          <Table striped bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Order Date</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((order, index) => (
                  <tr key={order.orderId}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{order.orderId}</td>
                    <td>{order.productName}</td>
                    <td>{order.quantity}</td>
                    <td>${order.totalAmount}</td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No sales data available</td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <Pagination className="justify-content-center">
            <Pagination.Prev
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SalesReport;
