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
            <Row className="products-grid">
              {currentProducts.map((product) => (
                <Col key={product.id} lg={4} md={6} className="mb-4">
                  <Card className="product-card">
                    <div className="product-image-container">
                      <Card.Img
                        variant="top"
                        src={`${process.env.REACT_APP_BASE_URL}${product.image}`}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                        }}
                      />
                    </div>
                    <Card.Body className="product-card-body">
                      <Card.Title className="product-title">{product.name}</Card.Title>
                      <Card.Text className="product-price">Price: ${product.price}</Card.Text>
                      <Card.Text className="product-status">Status: {product.status}</Card.Text>
                      <Card.Text className="product-seller">
                        Seller: {product.User?.firstName} {product.User?.lastName}
                      </Card.Text>
                      <div className="button-container">
                        <Button
                          variant="success"
                          className="action-button approve-button"
                          onClick={() => handleApprove(product.id)}
                        >
                          <FaCheckCircle className="button-icon" /> Approve
                        </Button>
                        <Button
                          variant="danger"
                          className="action-button reject-button"
                          onClick={() => handleReject(product.id)}
                        >
                          <FaTimesCircle className="button-icon" /> Reject
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
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .products-grid {
          margin: 0 -1rem;
        }

        .product-card {
          height: 100%;
          width: 100%;
          transition: all 0.3s ease;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(21, 128, 61, 0.15);
        }

        .product-image-container {
          position: relative;
          width: 100%;
          height: 250px; /* Fixed height for image container */
          overflow: hidden;
          background-color: #f8f9fa;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .product-card-body {
          padding: 1.5rem;
        }

        .product-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #15803d;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-price {
          font-size: 1.1rem;
          color: #15803d;
          font-weight: 500;
          margin-bottom: 0.75rem;
        }

        .product-status {
          color: #666;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .product-seller {
          color: #666;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .button-container {
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          margin-top: auto;
        }

        .action-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
          border: none;
        }

        .button-icon {
          font-size: 1.1rem;
        }

        .approve-button {
          background-color: #16a34a;
        }

        .approve-button:hover {
          background-color: #15803d;
          transform: translateY(-2px);
        }

        .reject-button {
          background-color: #ef4444;
        }

        .reject-button:hover {
          background-color: #dc2626;
          transform: translateY(-2px);
        }

        @media (max-width: 1200px) {
          .content-section {
            padding: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .content-section {
            padding: 1rem;
            border-radius: 0;
          }
          
          .product-image-container {
            height: 200px; /* Smaller height for mobile */
          }

          .product-card-body {
            padding: 1rem;
          }

          .button-container {
            flex-direction: column;
            gap: 0.75rem;
          }

          .action-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PendingProducts;