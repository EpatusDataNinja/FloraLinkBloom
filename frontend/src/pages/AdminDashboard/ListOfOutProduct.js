import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Container, Pagination, Spinner } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Title from "../../components_part/TitleCard";

const ListOfOutProduct = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const productsPerPage = 6;

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

      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/v1/product/activate/${productId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Product approved successfully!");
        // Refresh the products list
        fetchProducts();
      } else {
        throw new Error(response.data.message || "Failed to approve product");
      }
    } catch (error) {
      console.error("Error approving product:", error);
      toast.error(error.response?.data?.message || "Error approving product");
    }
  };

  const handleReject = async (productId) => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/v1/product/disactivate/${productId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Product rejected successfully!");
        // Refresh the products list
        fetchProducts();
      } else {
        throw new Error(response.data.message || "Failed to reject product");
      }
    } catch (error) {
      console.error("Error rejecting product:", error);
      toast.error(error.response?.data?.message || "Error rejecting product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Container>
      <Title title={'Products Pending Approval'}/>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Row>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <Col md={4} key={product.id}>
                  <Card className="mb-4 shadow-lg">
                    <Card.Img 
                      variant="top" 
                      src={product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_BASE_URL}${product.image}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                      alt={product.name}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Text>{product.description}</Card.Text>
                      <Card.Text>Price: ${product.price}</Card.Text>
                      <Card.Text>Stock: {product.quantity}</Card.Text>
                      <Card.Text>
                        Status: <strong className={
                          product.status === "Pending Approval" ? "text-warning" :
                          product.status === "rejected" ? "text-danger" :
                          "text-secondary"
                        }>{product.status}</strong>
                      </Card.Text>
                      <div className="d-flex justify-content-between">
                        <Button 
                          variant="success" 
                          className="me-2"
                          onClick={() => handleApprove(product.id)}
                          disabled={product.status === "rejected"}
                        >
                          <FaCheckCircle className="me-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="danger"
                          onClick={() => handleReject(product.id)}
                          disabled={product.status === "rejected"}
                        >
                          <FaTimesCircle className="me-2" />
                          Reject
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <div className="text-center">
                <p>No products pending approval.</p>
              </div>
            )}
          </Row>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              {Array.from({ length: totalPages }, (_, index) => (
                <Pagination.Item 
                  key={index + 1} 
                  active={index + 1 === currentPage} 
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}

      <ToastContainer />
    </Container>
  );
};

export default ListOfOutProduct;
