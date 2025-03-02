import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Container, Pagination } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import Title from "../../components_part/TitleCard";
const ListOfOutProduct = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6; // Number of products per page

  const fetchProducts = async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/outofstock`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      // toast.error("Error fetching products");
    }
  };

  const handleActivate = async (productId) => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/v1/product/activate/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Product activated successfully!");
      setTimeout(() => fetchProducts(), 3000);
    } catch (error) {
      toast.error("Error activating the product");
    }
  };

  const handleDeactivate = async (productId) => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/v1/product/disactivate/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Product deactivated successfully!");
      setTimeout(() => fetchProducts(), 3000);
    } catch (error) {
      toast.error("Error deactivating the product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Pagination Logic (Frontend)
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Container>
     <Title title={'List of Modelate products available.'}/>

      <Row>
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <Col md={4} key={product.id}>
              <Card className="mb-4 shadow-lg">
                <Card.Img variant="top" src={product.image} />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>{product.description}</Card.Text>
                  <Card.Text>Price: ${product.price}</Card.Text>
                  <Card.Text>Status: <strong>{product.status}</strong></Card.Text>

                  {product.status === "Out of Stock" ? (
                    <Button variant="success" onClick={() => handleActivate(product.id)}>
                      Activate
                    </Button>
                  ) : (
                    <Button variant="danger" onClick={() => handleDeactivate(product.id)}>
                      Deactivate
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center">No out-of-stock products available.</p>
        )}
      </Row>

      {/* Pagination */}
      <Pagination className="justify-content-center">
        {Array.from({ length: totalPages }, (_, index) => (
          <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
            {index + 1}
          </Pagination.Item>
        ))}
      </Pagination>
       <ToastContainer />
    </Container>
  );
};

export default ListOfOutProduct;
