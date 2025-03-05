import React, { useState } from 'react';
import { FaCheckCircle, FaBox, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { Card, Badge } from 'react-bootstrap';

const Sidebar = ({ show, setShow }) => {
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  // Dummy data for demonstration
  const approvedProducts = [
    {
      user: "Green Thumb Gardens",
      isTrusted: true,
      products: [
        {
          id: 1,
          product_name: "Red Roses",
          price: 29.99,
          stock_quantity: 50,
          image: "🌹",
          created_at: new Date()
        },
        {
          id: 2,
          product_name: "Tulips",
          price: 19.99,
          stock_quantity: 30,
          image: "🌷",
          created_at: new Date()
        }
      ]
    },
    {
      user: "Blooming Paradise",
      isTrusted: false,
      products: [
        {
          id: 3,
          product_name: "Sunflowers",
          price: 24.99,
          stock_quantity: 25,
          image: "🌻",
          created_at: new Date()
        }
      ]
    }
  ];

  // Format Date Helper
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle product navigation
  const handleProductNavigation = (sellerIndex, direction) => {
    const seller = approvedProducts[sellerIndex];
    const maxIndex = seller.products.length - 1;
    if (direction === 'next') {
      setCurrentProductIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    } else {
      setCurrentProductIndex(prev => prev <= 0 ? maxIndex : prev - 1);
    }
  };

  // Seller Products Modal Component
  const SellerProductsModal = ({ seller, onClose }) => (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 bg-success text-white">
            <div>
              <h3 className="modal-title h4 mb-0">{seller.user}'s Products</h3>
              <div className="d-flex align-items-center mt-2">
                {seller.isTrusted && (
                  <Badge bg="light" text="success" className="d-flex align-items-center me-2">
                    <FaCheckCircle className="me-1" /> Trusted Seller
                  </Badge>
                )}
                <span className="text-light small">
                  {seller.products.length} products
                </span>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <div className="row g-4">
              {seller.products.map((product) => (
                <div key={product.id} className="col-md-4">
                  <Card className="h-100 border-0 shadow-sm hover-card">
                    <div className="card-img-container">
                      <div className="product-image d-flex align-items-center justify-content-center">
                        <span className="product-emoji">{product.image}</span>
                      </div>
                    </div>
                    <Card.Body className="text-center">
                      <Card.Title className="text-success h5">{product.product_name}</Card.Title>
                      <p className="price mb-2">${product.price.toFixed(2)}</p>
                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <FaBox className="text-muted me-2" />
                        <span className="stock">Stock: {product.stock_quantity}</span>
                      </div>
                      <div className="text-muted small mb-3">
                        Added: {formatDate(product.created_at)}
                      </div>
                      <button className="btn btn-success rounded-pill px-4 w-100">
                        Add to Cart
                      </button>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <aside className={`sidebar ${show ? 'show' : ''}`}>
      <div className="sidebar-header">
        <h2 className="h5 mb-0">Choose Your Grower/Florist</h2>
      </div>
      <div className="sidebar-content">
        {approvedProducts.map((seller, sellerIndex) => (
          <div
            key={seller.user}
            className="seller-card"
            onClick={() => setSelectedSeller(seller)}
          >
            <div className="seller-info">
              <h3 className="h6 text-success fw-bold mb-1">{seller.user}</h3>
              <p className="text-muted small mb-2">
                {seller.products.length} available products
              </p>
              {seller.isTrusted && (
                <Badge bg="success-light" text="success" className="d-flex align-items-center w-auto">
                  <FaCheckCircle className="me-1" /> Trusted Seller
                </Badge>
              )}
            </div>

            {/* Product Preview */}
            <div className="preview-wrapper">
              <Card className="preview-card border-0 shadow-sm">
                {seller.products.map((product, index) => (
                  <div
                    key={product.id}
                    className={`preview-item ${index === currentProductIndex ? 'd-block' : 'd-none'}`}
                  >
                    <div className="preview-image">
                      <span className="preview-emoji">{product.image}</span>
                    </div>
                    <div className="preview-details">
                      <h4 className="h6 text-success mb-1">{product.product_name}</h4>
                      <p className="price-small mb-0">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                {seller.products.length > 1 && (
                  <div className="preview-navigation">
                    <button
                      className="nav-btn prev"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductNavigation(sellerIndex, 'prev');
                      }}
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      className="nav-btn next"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductNavigation(sellerIndex, 'next');
                      }}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        ))}
      </div>

      {selectedSeller && (
        <SellerProductsModal
          seller={selectedSeller}
          onClose={() => setSelectedSeller(null)}
        />
      )}

      <style jsx="true">{`
        .sidebar {
          width: 320px;
          position: fixed;
          top: 68px;
          bottom: 0;
          left: 0;
          background: white;
          z-index: 40;
          overflow-y: auto;
          transition: all 0.3s ease-in-out;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .sidebar-header {
          background: #15803d;
          color: white;
          padding: 1.25rem;
          text-align: center;
        }

        .sidebar-content {
          padding: 1.5rem;
        }

        .seller-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .seller-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .seller-info {
          margin-bottom: 1rem;
        }

        .preview-wrapper {
          position: relative;
        }

        .preview-card {
          border-radius: 8px;
          overflow: hidden;
        }

        .preview-image {
          background: #15803d;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-emoji {
          font-size: 2.5rem;
          transition: transform 0.3s ease;
        }

        .seller-card:hover .preview-emoji {
          transform: scale(1.1);
        }

        .preview-details {
          padding: 0.75rem;
          text-align: center;
        }

        .preview-navigation {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          padding: 0 0.5rem;
          pointer-events: none;
        }

        .nav-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.3s ease;
          color: #15803d;
        }

        .nav-btn:hover {
          background: white;
          transform: scale(1.1);
        }

        .price-small {
          color: #15803d;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .card-img-container {
          position: relative;
          padding-top: 75%;
          background-color: #15803d;
          overflow: hidden;
        }

        .product-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .product-emoji {
          font-size: 3.5rem;
          transition: transform 0.3s ease;
        }

        .hover-card:hover .product-emoji {
          transform: scale(1.2);
        }

        .price {
          font-size: 1.25rem;
          font-weight: 600;
          color: #15803d;
        }

        .stock {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .bg-success-light {
          background-color: #dcfce7 !important;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            border-right: none;
          }
          .sidebar.show {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
