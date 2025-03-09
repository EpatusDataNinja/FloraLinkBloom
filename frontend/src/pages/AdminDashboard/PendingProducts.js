import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Container, Pagination, Spinner } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Title from "../../components_part/TitleCard";

const PendingProducts = () => {
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

      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/pending`, {
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div className="pending-products">
      <Title title="Pending Products" />
      <div className="content-section">
        <ToastContainer />
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <>
            <Row>
              {currentProducts.map((product) => (
                <Col key={product.id} md={4} className="mb-4">
                  <Card className="product-card">
                    <Card.Img
                      variant="top"
                      src={`${process.env.REACT_APP_BASE_URL}${product.image}`}
                      alt={product.name}
                      className="product-image"
                    />
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Text>Price: ${product.price}</Card.Text>
                      <Card.Text>Status: {product.status}</Card.Text>
                      <Card.Text>
                        Seller: {product.User?.firstName} {product.User?.lastName}
                      </Card.Text>
                      <div className="d-flex justify-content-between">
                        <Button
                          variant="success"
                          onClick={() => handleApprove(product.id)}
                        >
                          <FaCheckCircle /> Approve
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleReject(product.id)}
                        >
                          <FaTimesCircle /> Reject
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            {products.length > productsPerPage && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  {Array.from({ length: Math.ceil(products.length / productsPerPage) }).map(
                    (_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    )
                  )}
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx="true">{`
        .pending-products {
          width: 100%;
        }

        .content-section {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .product-card {
          height: 100%;
          transition: transform 0.2s;
        }

        .product-card:hover {
          transform: translateY(-5px);
        }

        .product-image {
          height: 200px;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .content-section {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PendingProducts; 