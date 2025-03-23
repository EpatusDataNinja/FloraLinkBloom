import React from "react";
import { Button, Card, Col, Row, Pagination, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle, FaTag, FaUser, FaBox } from 'react-icons/fa';

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
          <Row className="products-grid">
            {currentProducts.map((product) => (
              <Col key={product.id} md={4} className="mb-4">
                <Card className="product-card">
                  <div className="modal-product-image">
                  <Card.Img
                    variant="top"
                    src={`${process.env.REACT_APP_BASE_URL}${product.image}`}
                    alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                      }}
                    />
                  </div>
                  <Card.Body className="card-body">
                    <div className="product-info">
                      <Card.Title className="product-title">{product.name}</Card.Title>
                      <div className="product-details">
                        <div className="detail-item">
                          <FaTag className="detail-icon price-icon" />
                          <span className="detail-label">Price:</span>
                          <span className="detail-value price-value">${product.price}</span>
                        </div>
                        <div className="detail-item">
                          <FaBox className="detail-icon status-icon" />
                          <span className="detail-label">Status:</span>
                          <span className={`detail-value status-value ${product.status.toLowerCase()}`}>
                            {product.status}
                          </span>
                        </div>
                        <div className="detail-item">
                          <FaUser className="detail-icon seller-icon" />
                          <span className="detail-label">Seller:</span>
                          <span className="detail-value seller-value">
                            {product.user ? `${product.user.firstname} ${product.user.lastname}` : 'Unknown Seller'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="button-container">
                      {product.status === "Pending Approval" && (
                        <>
                          <Button
                            variant="success"
                            className="action-button"
                            onClick={() => handleApprove(product.id)}
                          >
                            <FaCheckCircle className="button-icon" /> Approve
                          </Button>
                          <Button
                            variant="danger"
                            className="action-button"
                            onClick={() => handleReject(product.id)}
                          >
                            <FaTimesCircle className="button-icon" /> Reject
                          </Button>
                        </>
                      )}
                      {product.status === "Out of Stock" && (
                        <Button
                          variant="success"
                          className="action-button w-100"
                          onClick={() => handleApprove(product.id)}
                        >
                          <FaCheckCircle className="button-icon" /> Restore to Stock
                        </Button>
                      )}
                      {product.status === "rejected" && (
                        <div className="rejected-message">
                          <span className="text-danger">Product Rejected</span>
                          <small className="d-block text-muted">Contact support for details</small>
                        </div>
                      )}
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
          background: #f9fafb;
          padding: 2rem;
          border-radius: 10px;
        }

        .products-grid {
          margin: 0 -1rem;
        }

        .product-card {
          height: 100%;
          background: white;
          border-radius: 12px;
          border: 1.5px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          overflow: hidden;
          transition: all 0.3s ease;
          max-width: 340px;
          margin: 0 auto;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          border-color: #15803d;
        }

        .modal-product-image {
          position: relative;
          width: 100%;
          height: 210px;
          overflow: hidden;
          background-color: #f8f9fa;
        }

        .modal-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .modal-product-image img {
          transform: scale(1.05);
        }

        .card-body {
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 0.65rem;
        }

        .product-info {
          flex-grow: 1;
        }

        .product-title {
          font-size: 1.1rem;
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.25rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-icon {
          font-size: 1rem;
          width: 18px;
          text-align: center;
        }

        .price-icon {
          color: #16a34a;
        }

        .status-icon {
          color: #3b82f6;
        }

        .seller-icon {
          color: #6b7280;
        }

        .detail-label {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .price-value {
          color: #16a34a;
        }

        .status-value {
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-value.pending {
          background-color: #fef3c7;
          color: #92400e;
        }

        .status-value.active {
          background-color: #dcfce7;
          color: #166534;
        }

        .status-value.inactive {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .seller-value {
          color: #374151;
        }

        .button-container {
          display: flex;
          gap: 0.65rem;
          margin-top: 0.65rem;
        }

        .action-button {
          flex: 1;
          padding: 0.5rem 0.75rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          border: none;
        }

        .action-button.btn-success {
          background-color: #16a34a;
        }

        .action-button.btn-danger {
          background-color: #ef4444;
        }

        .action-button:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }

        .button-icon {
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .content-section {
            padding: 1rem;
          }

          .modal-product-image {
            height: 200px;
          }

          .card-body {
            padding: 0.75rem;
          }

          .action-button {
            padding: 0.4rem 0.6rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductModerationList; 