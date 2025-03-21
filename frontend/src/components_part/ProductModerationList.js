import React from "react";
import { Button, Card, Col, Row, Pagination, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ProductModerationList = ({
  products,
  currentProducts,
  loading,
  currentPage,
  productsPerPage,
  handleApprove,
  handleReject,
  handlePageChange,
  title
}) => {
  return (
    <div className="content-section">
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

      <style jsx="true">{`
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

export default ProductModerationList; 