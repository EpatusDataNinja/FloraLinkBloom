import React, { useState, useEffect, useCallback } from 'react';
import { FaCheckCircle, FaBox, FaChevronRight, FaChevronLeft, FaUser } from 'react-icons/fa';
import { Card, Badge, Spinner, Modal, Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// ProductCarousel Component
const ProductCarousel = ({ products = [], currentIndex = 0, onNext, onPrev, onViewAll, seller }) => {
  const [autoPlay, setAutoPlay] = useState(true);
  const autoPlayDelay = 5000;

  useEffect(() => {
    let intervalId;
    if (autoPlay && products.length > 1) {
      intervalId = setInterval(() => {
        onNext();
      }, autoPlayDelay);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoPlay, onNext, products.length]);

  const handleMouseEnter = () => setAutoPlay(false);
  const handleMouseLeave = () => setAutoPlay(true);

  if (!products || products.length === 0) {
    return <div className="text-center">No products available</div>;
  }

  return (
    <div className="carousel-wrapper">
      <div className="seller-profile-header">
        <div className="d-flex align-items-center">
          <div className="seller-avatar">
            {seller.image ? (
              <img 
                src={seller.image.startsWith('http') ? seller.image : `${process.env.REACT_APP_BASE_URL}${seller.image}`}
                alt={seller.name}
                className="rounded-circle"
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  objectFit: 'cover',
                  border: '3px solid #15803d',
                  backgroundColor: 'white'
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/60?text=Seller';
                }}
              />
            ) : (
              <div 
                className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                style={{ 
                  width: '60px', 
                  height: '60px',
                  border: '3px solid #15803d'
                }}
              >
                <FaUser size={30} className="text-success" />
              </div>
            )}
          </div>
          <div>
            <h5 className="mb-0 text-success fw-bold">{seller.name || 'Unknown Seller'}</h5>
            <div className="d-flex align-items-center">
              <small className="text-muted me-2">
                {products.length ? `${products.length} products` : 'No products'}
              </small>
              <button 
                className="view-all-link"
                onClick={onViewAll}
              >
                View all →
              </button>
            </div>
          </div>
                      </div>
                    </div>

      <div 
        className="product-carousel-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="product-counter-overlay">
          {currentIndex + 1} of {products.length}
        </div>
        
        <div className="product-carousel">
          {products.map((product, index) => (
            <div 
              key={product.id}
              className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
              style={{
                opacity: index === currentIndex ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out'
              }}
            >
              <div className="product-content">
                <div className="product-image-container">
                  <img 
                    src={product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_BASE_URL}${product.image}`}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                      </div>

                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-price">${product.price?.toFixed(2)}</p>
                  <div className="product-meta">
                    <span className="stock">Stock: {product.quantity}</span>
                    <span className="date">
                      Added: {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                      </div>
                  <p className="product-description">{product.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {products.length > 1 && (
          <div className="carousel-controls">
            <button 
              className="carousel-control prev" 
              onClick={onPrev}
              aria-label="Previous product"
            >
              <FaChevronLeft />
            </button>
            <button 
              className="carousel-control next" 
              onClick={onNext}
              aria-label="Next product"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// SellerProductsModal Component
const SellerProductsModal = ({ seller, onClose, onAddToCart }) => {
  if (!seller) return null;

  return (
    <Modal show={true} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <div className="d-flex align-items-center">
            <div className="seller-avatar me-3">
              {seller.image ? (
                <img 
                  src={seller.image.startsWith('http') ? seller.image : `${process.env.REACT_APP_BASE_URL}${seller.image}`}
                  alt={seller.name}
                  className="rounded-circle"
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    objectFit: 'cover',
                    border: '2px solid #15803d',
                    backgroundColor: 'white'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/50?text=Seller';
                  }}
                />
              ) : (
                <div 
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    border: '2px solid #15803d' 
                  }}
                >
                  <FaUser size={24} className="text-success" />
                </div>
              )}
            </div>
            <div>
              <h5 className="mb-0">{seller.name}</h5>
              <small className="text-muted">
                {seller.products?.length || 0} products
              </small>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row g-4">
          {seller.products?.map((product) => (
            <div key={product.id} className="col-md-4">
              <Card className="h-100 border-0 shadow-sm product-card">
                <Card.Img 
                  variant="top" 
                  src={product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_BASE_URL}${product.image}`}
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                  }}
                />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>{product.description}</Card.Text>
                  <Card.Text className="text-success fw-bold">${product.price?.toFixed(2)}</Card.Text>
                  <Card.Text>Stock: {product.quantity}</Card.Text>
                  <Button 
                    variant="success"
                    onClick={() => onAddToCart(product)}
                    disabled={product.quantity <= 0}
                    className="w-100"
                  >
                    Add to Cart
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};

const Sidebar = ({ show, setShow }) => {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [currentProductIndex, setCurrentProductIndex] = useState({});
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`);

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const products = response.data.data;
        
        const grouped = products.reduce((acc, product) => {
          const sellerId = product.userID;
          if (!acc[sellerId]) {
            acc[sellerId] = {
              seller: {
                id: sellerId,
                name: `${product.firstname} ${product.lastname}`.trim() || 'Unknown Seller',
                image: product.userImage,
                isTrusted: product.userStatus === 'active',
                totalProducts: 0
              },
              products: []
            };
          }
          acc[sellerId].seller.totalProducts++;
          acc[sellerId].products.push({
            ...product,
            sellerName: `${product.firstname} ${product.lastname}`.trim() || 'Unknown Seller',
            sellerImage: product.userImage
          });
          return acc;
        }, {});

        setGroupedProducts(grouped);
        
        const initialIndexes = Object.keys(grouped).reduce((acc, sellerId) => {
          acc[sellerId] = 0;
          return acc;
        }, {});
        setCurrentProductIndex(initialIndexes);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductNavigation = useCallback((sellerId, direction) => {
    const sellerProducts = groupedProducts[sellerId].products;
    const maxIndex = sellerProducts.length - 1;
    setCurrentProductIndex(prev => ({
      ...prev,
      [sellerId]: direction === 'next' 
        ? (prev[sellerId] >= maxIndex ? 0 : prev[sellerId] + 1)
        : (prev[sellerId] <= 0 ? maxIndex : prev[sellerId] - 1)
    }));
  }, [groupedProducts]);

  const addToGuestCart = async (product) => {
    const isAuthenticated = localStorage.getItem("token");
    const cartKey = isAuthenticated ? "cart" : "guestCart";
    
    try {
        // First validate product availability with server
        const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`
        );
        
        const currentProduct = response.data.data.find(p => p.id === product.id);
        if (!currentProduct) {
            toast.error(
                <div>
                    <h6>Product Unavailable</h6>
                    <p>This product is no longer available.</p>
                </div>,
                { autoClose: 5000 }
            );
            return;
        }

        if (currentProduct.quantity <= 0) {
            toast.error(
                <div>
                    <h6>Out of Stock</h6>
                    <p>Sorry, this product is currently out of stock.</p>
                </div>,
                { autoClose: 5000 }
            );
            return;
        }

        const existingCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
        
        // Check for mixed sellers
        if (existingCart.length > 0) {
            const currentSellerId = existingCart[0].sellerId;
            const currentSellerName = existingCart[0].sellerName;

            if (product.userID !== currentSellerId) {
                toast.error(
                    <div>
                        <h6 className="mb-2">Cannot Mix Sellers in Cart</h6>
                        <p>Your cart has items from: <strong>{currentSellerName}</strong></p>
                        <p>Please either:</p>
                        <ul className="mb-0">
                            <li>Complete your current cart</li>
                            <li>Clear your cart to add items from a different seller</li>
                        </ul>
                        <div className="mt-3">
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                    localStorage.setItem(cartKey, "[]");
                                    addToGuestCart(product); // Retry adding after clearing
                                }}
                            >
                                Clear Cart
                            </Button>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => {
                                    if (isAuthenticated) {
                                        navigate('/cart');
                                    } else {
                                        setShowModal(false); // Close the current modal if open
                                        const event = new CustomEvent('openGuestCart');
                                        window.dispatchEvent(event);
                                    }
                                }}
                            >
                                View Cart
                            </Button>
                        </div>
                    </div>,
                    {
                        autoClose: false,
                        position: "top-center",
                        style: { backgroundColor: '#fff3cd', color: '#664d03' }
                    }
                );
                return;
            }
        }

        // Check for existing product
        const existingProduct = existingCart.find(item => item.id === product.id);
        if (existingProduct) {
            toast.info(
                <div>
                    <h6 className="mb-2">Product Already in Cart</h6>
                    <p>Current quantity: {existingProduct.quantity}</p>
                    <p>Maximum available: {currentProduct.quantity}</p>
                    <Button 
                        variant="success"
                        size="sm"
                        className="w-100"
                        onClick={() => {
                            if (isAuthenticated) {
                                navigate('/cart');
                            } else {
                                setShowModal(false); // Close the current modal if open
                                const event = new CustomEvent('openGuestCart');
                                window.dispatchEvent(event);
                            }
                        }}
                    >
                        View Cart
                    </Button>
                </div>,
                {
                    autoClose: 8000,
                    position: "top-center",
                    style: { backgroundColor: '#cff4fc', color: '#055160' }
                }
            );
            return;
        }

        // Add to cart with updated product data
        const cartItem = {
            id: product.id,
            name: product.name,
            price: currentProduct.price,
            image: product.image,
            quantity: 1,
            availableQuantity: currentProduct.quantity,
            sellerId: product.userID,
            sellerName: product.sellerName
        };

        localStorage.setItem(cartKey, JSON.stringify([...existingCart, cartItem]));
        
        toast.success(
            <div>
                <h6 className="mb-2">{product.name} added to cart!</h6>
                <small>Go to cart to adjust quantity if needed.</small>
                <Button 
                    variant="success"
                    size="sm"
                    className="w-100 mt-2"
                    onClick={() => {
                        if (isAuthenticated) {
                            navigate('/cart');
                        } else {
                            setShowModal(false); // Close the current modal if open
                            const event = new CustomEvent('openGuestCart');
                            window.dispatchEvent(event);
                        }
                    }}
                >
                    View Cart
                </Button>
            </div>,
            {
                position: "top-right",
                autoClose: 3000,
                style: { backgroundColor: '#d1e7dd', color: '#0f5132' }
            }
        );

    } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error(
            <div>
                <h6>Error Adding to Cart</h6>
                <p>Please try again or contact support if the problem persists.</p>
            </div>,
            { autoClose: 5000 }
        );
    }
  };

  const handleViewAll = (sellerData) => {
    const enrichedSellerData = {
      ...sellerData.seller,
      products: sellerData.products,
      totalProducts: sellerData.products.length,
      image: sellerData.seller.image || null
    };
    setSelectedSeller(enrichedSellerData);
    setShowModal(true);
  };

  return (
    <>
      <aside className={`sidebar ${show ? 'show' : ''}`}>
        <div className="sidebar-header">
          <h2 className="h5 mb-0">Choose Your Grower/Florist</h2>
        </div>
        <div className="sidebar-content">
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="success" />
              </div>
          ) : Object.entries(groupedProducts).length > 0 ? (
            Object.entries(groupedProducts).map(([sellerId, sellerData]) => (
              <div key={sellerId} className="seller-section mb-4">
                <ProductCarousel
                  products={sellerData.products}
                  currentIndex={currentProductIndex[sellerId] || 0}
                  onNext={() => handleProductNavigation(sellerId, 'next')}
                  onPrev={() => handleProductNavigation(sellerId, 'prev')}
                  onViewAll={() => handleViewAll(sellerData)}
                  seller={sellerData.seller}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p>No products available</p>
            </div>
          )}
        </div>
      </aside>

      {showModal && selectedSeller && (
        <SellerProductsModal
          seller={selectedSeller}
          onClose={() => {
            setShowModal(false);
            setSelectedSeller(null);
          }}
          onAddToCart={addToGuestCart}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

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
          padding: 1rem;
          text-align: center;
        }

        .sidebar-content {
          padding: 1rem;
        }

        .seller-section {
          background: #f8faf8;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .seller-section:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .seller-profile-header {
          padding: 0.75rem;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .seller-avatar img, .seller-avatar div {
          width: 40px;
          height: 40px;
          border: 2px solid #15803d;
        }

        .product-carousel-container {
          position: relative;
          background: #f0faf0;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 2px 4px rgba(21, 128, 61, 0.1);
          overflow: hidden;
          height: 400px;
        }

        .product-counter-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          z-index: 2;
        }

        .product-carousel {
          position: relative;
          height: 100%;
        }

        .carousel-item {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
        }

        .carousel-item.active {
          opacity: 1;
          z-index: 1;
        }

        .product-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #f0faf0;
        }

        .product-image-container {
          position: relative;
          width: 100%;
          height: 200px;
          background: #fff5f5;
        }

        .product-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          padding: 15px;
          background: #fff5f5;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .product-name {
          font-size: 1rem;
          margin: 0 0 8px 0;
          font-weight: 600;
          color: #15803d;
        }

        .product-price {
          font-size: 1rem;
          margin: 0 0 8px 0;
          color: #15803d;
          font-weight: 600;
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 0.8rem;
          color: #666;
        }

        .product-description {
          font-size: 0.85rem;
          line-height: 1.4;
          color: #444;
          -webkit-line-clamp: 3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
        }

        .carousel-controls {
          position: absolute;
          top: 100px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 10px;
          pointer-events: none;
        }

        .carousel-control {
          width: 30px;
          height: 30px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.3s ease;
          color: #15803d;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .carousel-control:hover {
          background: white;
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .view-all-link {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.8rem;
          color: #15803d;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          font-weight: 500;
          margin-left: 60px;
        }

        .view-all-link:hover {
          color: #166534;
          transform: translateX(2px);
        }

        .product-card {
          background-color: #f0f7f0;
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(21, 128, 61, 0.15);
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            width: 100%;
          }
          .sidebar.show {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
