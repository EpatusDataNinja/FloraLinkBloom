import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Container, Pagination, Nav, Tab } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa'; // Add icons for no data
import Title from "../../components_part/TitleCard";
const NoDataCard = ({ message, icon }) => (
  <Col className="text-center">
    <Card className="shadow-sm border-0 rounded p-4">
      <Card.Body>
        <div className="mb-3">
          <FaExclamationTriangle size={50} color="gray" />
        </div>
        <Card.Title>No Data Available</Card.Title>
        <Card.Text>{message}</Card.Text>
      </Card.Body>
    </Card>
  </Col>
);

const ProductPanel = () => {
  const [outOfStock, setOutOfStock] = useState([]);
  const [inStock, setInStock] = useState([]);
  const [outCurrentPage, setOutCurrentPage] = useState(1);
  const [inCurrentPage, setInCurrentPage] = useState(1);
  const productsPerPage = 3;

  // Fetch In Stock Products
  const fetchInStock = async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/instock`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInStock(response.data.data);
    } catch (error) {
      console.error("Error fetching in-stock products:", error);
    }
  };

  // Fetch Out of Stock Products
  const fetchOutOfStock = async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/outofstock`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOutOfStock(response.data.data);
    } catch (error) {
      console.error("Error fetching out-of-stock products:", error);
    }
  };

  useEffect(() => {
    fetchInStock();
    fetchOutOfStock();
  }, []);

  // Pagination Logic for Out of Stock Products
  const outIndexOfLastProduct = outCurrentPage * productsPerPage;
  const outIndexOfFirstProduct = outIndexOfLastProduct - productsPerPage;
  const currentOutOfStock = outOfStock.slice(outIndexOfFirstProduct, outIndexOfLastProduct);
  const outTotalPages = Math.ceil(outOfStock.length / productsPerPage);

  const handleOutPageChange = (page) => {
    setOutCurrentPage(page);
  };

  // Pagination Logic for In Stock Products
  const inIndexOfLastProduct = inCurrentPage * productsPerPage;
  const inIndexOfFirstProduct = inIndexOfLastProduct - productsPerPage;
  const currentInStock = inStock.slice(inIndexOfFirstProduct, inIndexOfLastProduct);
  const inTotalPages = Math.ceil(inStock.length / productsPerPage);

  const handleInPageChange = (page) => {
    setInCurrentPage(page);
  };

  return (
    <Container>
       <Title title={'List Products'}/>

      <Tab.Container defaultActiveKey="outofstock">
        <Nav variant="pills" className="mb-4 justify-content-center">
          <Nav.Item>
            <Nav.Link eventKey="outofstock">Out of Stock</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="instock">In Stock</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Out of Stock Products Panel */}
          <Tab.Pane eventKey="outofstock">
            <Row>
              {currentOutOfStock.length > 0 ? (
                currentOutOfStock.map((product) => (
                  <Col md={4} key={product.id}>
                    <Card className="mb-4 shadow-lg">
                      <Card.Img variant="top" src={product.image} />
                      <Card.Body>
                        <Card.Title>{product.name}</Card.Title>
                        <Card.Text>{product.description}</Card.Text>
                        <Card.Text>Price: ${product.price}</Card.Text>
                        <Card.Text>Status: <strong>{product.status}</strong></Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <NoDataCard message="No out-of-stock products available." icon={<FaBoxOpen />} />
              )}
            </Row>

            <Pagination className="justify-content-center">
              {Array.from({ length: outTotalPages }, (_, index) => (
                <Pagination.Item key={index + 1} active={index + 1 === outCurrentPage} onClick={() => handleOutPageChange(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Tab.Pane>

          {/* In Stock Products Panel */}
          <Tab.Pane eventKey="instock">
            <Row>
              {currentInStock.length > 0 ? (
                currentInStock.map((product) => (
                  <Col md={4} key={product.id}>
                    <Card className="mb-4 shadow-lg">
                      <Card.Img variant="top" src={product.image} />
                      <Card.Body>
                        <Card.Title>{product.name}</Card.Title>
                        <Card.Text>{product.description}</Card.Text>
                        <Card.Text>Price: ${product.price}</Card.Text>
                        <Card.Text>Status: <strong>{product.status}</strong></Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <NoDataCard message="No in-stock products available." icon={<FaBoxOpen />} />
              )}
            </Row>

            <Pagination className="justify-content-center">
              {Array.from({ length: inTotalPages }, (_, index) => (
                <Pagination.Item key={index + 1} active={index + 1 === inCurrentPage} onClick={() => handleInPageChange(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      <ToastContainer />
    </Container>
  );
};

export default ProductPanel;
