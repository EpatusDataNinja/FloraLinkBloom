import React, { useEffect, useState, useCallback } from "react"; 
import { Button, Card, Container, Modal, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import { FaBox, FaDollarSign, FaShoppingCart, FaPhone, FaCartPlus, FaChevronLeft, FaChevronRight, FaUser } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Title from "../../components_part/TitleCard";
import { useNavigate } from "react-router-dom";

const SellerProfile = ({ seller }) => {
  if (!seller) return null;

  return (
    <div className="seller-profile-header">
      <div className="d-flex align-items-center">
        <div className="seller-avatar">
          {seller.image ? (
            <img 
              src={seller.image}
              alt={seller.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/60?text=Seller';
              }}
            />
          ) : (
            <div className="seller-avatar-placeholder">
              <FaUser size={30} className="text-success" />
            </div>
          )}
        </div>
        <div className="seller-info">
          <div className="seller-name">{seller.name}</div>
          <div className="seller-stats">
            {seller.totalProducts} {seller.totalProducts === 1 ? 'product' : 'products'}
          </div>
        </div>
      </div>
      <button className="view-all-btn">
        View All Products
      </button>
    </div>
  );
};

const ProductCarousel = ({ products = [], currentIndex = 0, onNext, onPrev, onViewAll, seller }) => {
  const [autoPlay, setAutoPlay] = useState(true);
  const autoPlayDelay = 5000; // 5 seconds

  useEffect(() => {
    let intervalId;
    if (autoPlay && products.length > 1) {
      intervalId = setInterval(() => {
        onNext(); // Call the existing onNext function
      }, autoPlayDelay);
    }

    // Cleanup interval on unmount or when autoPlay changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoPlay, onNext, products.length]);

  // Pause auto-play when user hovers over carousel
  const handleMouseEnter = () => setAutoPlay(false);
  const handleMouseLeave = () => setAutoPlay(true);

  if (!products || products.length === 0) {
    return <div className="text-center">No products available</div>;
  }

  return (
    <div className="carousel-wrapper">
      {/* Seller Profile directly above carousel */}
      <div className="seller-profile-header">
        <div className="d-flex align-items-center">
          <div className="seller-avatar">
            {seller.image ? (
              <img 
                src={seller.image}
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
                  console.log('Image load error:', e);
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
                    src={`${process.env.REACT_APP_BASE_URL}${product.image}`}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>

                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-price">${product.price}</p>
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

const SellerProductsModal = ({ seller, onClose, onOrderClick, onAddToCart }) => {
  console.log('Modal seller data:', seller);

  return (
    <Modal show={true} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <div className="d-flex align-items-center">
            <div className="seller-avatar me-3">
              {seller.image ? (
                <img 
                  src={seller.image}
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
                    console.log('Modal image error:', e);
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
                {seller.totalProducts} products
              </small>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row g-4">
          {seller.products.map((product) => (
            <div key={product.id} className="col-md-4">
              <Card className="h-100 border-0 shadow-sm product-card">
                <Card.Img 
                  variant="top" 
                  src={`${process.env.REACT_APP_BASE_URL}${product.image}`}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>{product.description}</Card.Text>
                  <Card.Text className="text-success fw-bold">${product.price}</Card.Text>
                  <Card.Text>Stock: {product.quantity}</Card.Text>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      className="flex-grow-1"
                      onClick={() => onOrderClick(product)}
                    >
                      <FaShoppingCart /> Order Now
                    </Button>
                    <Button 
                      variant="success"
                      onClick={() => onAddToCart(product)}
                      disabled={product.quantity <= 0}
                    >
                      <FaCartPlus />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};

const InStockProducts = () => {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [currentProductIndex, setCurrentProductIndex] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderData, setOrderData] = useState({ quantity: 1, phone: "" });
  const [loading, setLoading] = useState(false);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view products");
        navigate('/login');
        return;
      }

      console.log('Fetching products...'); // Debug log

      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Response:', response.data); // Debug log

      if (response.data.success) {
        const products = response.data.data;
        
        // Debug log
        console.log('Products received:', products);

        // Group products by seller and include seller information
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

        console.log('Grouped products with seller details:', grouped); // Add this log
        
        console.log('First product with user details:', response.data.data[0]);
        
        setGroupedProducts(grouped);
        
        // Initialize current product index for each seller
        const initialIndexes = Object.keys(grouped).reduce((acc, sellerId) => {
          acc[sellerId] = 0;
          return acc;
        }, {});
        setCurrentProductIndex(initialIndexes);
      } else {
        console.error('API returned success: false', response.data);
        toast.error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        toast.error(error.response.data.message || "Server error while fetching products");
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error("No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        toast.error("Error setting up request");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setOrderData({ quantity: 1, phone: "" });
    setShowModal(true);
  };

  const handleOrderSubmit = async () => {
    if (!orderData.quantity || !orderData.phone) {
      toast.error("Please enter quantity and phone number!");
      return;
    }

    setLoading(true);

    try {
      let token = localStorage.getItem("token");
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/v1/order/add`, {
        productID: selectedProduct.id,
        quantity: orderData.quantity,
        number: orderData.phone,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Order placed successfully!");
      setShowModal(false);
      setShowApprovalPopup(true);

      setTimeout(() => {
        setShowApprovalPopup(false);
        toast.success("Payment Approved! Congratulations!");
      }, 5000);

    } catch (error) {
      toast.error("Failed to place order!");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = selectedProduct ? orderData.quantity * selectedProduct.price : 0;

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Check if cart has items from a different seller
    if (existingCart.length > 0) {
      const currentSellerId = existingCart[0].sellerId;
      const currentSellerName = existingCart[0].sellerName;

      if (product.userID !== currentSellerId) {
        toast.error(
          <div>
            <h6 className="mb-2">Cannot Mix Sellers in Cart</h6>
            <p>Your cart already has items from: <strong>{currentSellerName}</strong></p>
            <p>Please either:</p>
            <ul className="mb-0">
              <li>Complete your current cart</li>
              <li>Clear your cart to add items from a different seller</li>
            </ul>
          </div>,
          {
            autoClose: 6000,
            position: "top-center",
            style: { backgroundColor: '#fff3cd', color: '#664d03' }
          }
        );
        return;
      }
    }

    // Check if product already exists in cart
    const existingItem = existingCart.find(item => item.id === product.id);
    if (existingItem) {
      toast.info(
        <div>
          <h6 className="mb-2">Product Already in Cart</h6>
          <p>This product is already in your cart.</p>
          <p>You can adjust the quantity in the cart page.</p>
          <button 
            onClick={() => navigate('/cart')} 
            className="btn btn-sm btn-success mt-2"
          >
            Go to Cart
          </button>
        </div>,
        {
          autoClose: 5000,
          position: "top-center",
          style: { backgroundColor: '#cff4fc', color: '#055160' }
        }
      );
      return;
    }

    // Create cart item with seller information
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      availableQuantity: product.quantity,
      sellerId: product.userID,
      sellerName: `${product.firstname} ${product.lastname}`.trim()
    };

    // Add new item
    localStorage.setItem("cart", JSON.stringify([...existingCart, cartItem]));
    toast.success(
      <div>
        <p className="mb-1"><strong>{product.name}</strong> added to cart!</p>
        <small>Go to cart to adjust quantity if needed.</small>
      </div>,
      {
        position: "top-right",
        autoClose: 3000
      }
    );
  };

  const viewCart = () => {
    navigate("/cart");
  };

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

  const handleViewAll = (sellerData) => {
    console.log('Opening modal with seller data:', sellerData);
    // Ensure we pass the complete seller data including image and products count
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
    <Container fluid className="mt-0 pt-0">
      <div className="d-flex justify-content-between align-items-center mb-0">
        <Title title={'In-Stock Products'} className="small-title"/>
        <Button variant="outline-success" size="sm" onClick={viewCart} className="cart-button">
          <FaShoppingCart className="me-2" />
          View Cart
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="seller-products-container">
          {Object.entries(groupedProducts || {}).length > 0 ? (
            Object.entries(groupedProducts).map(([sellerId, sellerData]) => (
              <div key={sellerId} className="seller-section">
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
            <div className="text-center">
              <p>No products available</p>
            </div>
          )}
        </div>
      )}

      {/* Seller Products Modal */}
      {showModal && selectedSeller && (
        <SellerProductsModal
          seller={selectedSeller}
          onClose={() => {
            setShowModal(false);
            setSelectedSeller(null);
          }}
          onOrderClick={handleOrderClick}
          onAddToCart={addToCart}
        />
      )}

      {/* Order Modal */}
      {showModal && selectedProduct && (
        <Modal show={true} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Order {selectedProduct?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label><FaBox className="text-warning" /> Quantity</Form.Label>
                <Form.Control 
                  type="number" 
                  min="1" 
                  max={selectedProduct?.quantity} 
                  value={orderData.quantity} 
                  onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })} 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><FaPhone className="text-primary" /> Phone Number</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter your phone number" 
                  value={orderData.phone} 
                  onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })} 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><FaDollarSign className="text-success" /> Total Amount</Form.Label>
                <Form.Control type="text" value={`$${totalAmount}`} readOnly />
              </Form.Group>
              <Button 
                variant="success" 
                onClick={handleOrderSubmit} 
                className="w-100" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  "Confirm Order"
                )}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {/* Approval Popup */}
      <Modal show={showApprovalPopup} centered>
        <Modal.Body className="text-center">
          <h5>Please check your phone to approve the payment!</h5>
        </Modal.Body>
      </Modal>

      <ToastContainer />

      <style jsx="true">{`
        .seller-products-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 20px;
          margin-top: 45px;
        }

        .seller-section {
          width: 100%;
        }

        .carousel-wrapper {
          margin-bottom: 20px;
        }

        .seller-profile-header {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          padding: 20px;
          background-color: #f8faf8;
          border-radius: 12px 12px 0 0;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .seller-avatar {
          position: relative;
          margin-right: 15px;
        }

        .seller-avatar img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #15803d;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .seller-avatar img:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .seller-info {
          flex-grow: 1;
        }

        .seller-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #15803d;
          margin-bottom: 4px;
        }

        .seller-stats {
          font-size: 0.9rem;
          color: #666;
        }

        .view-all-link {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.85rem;
          color: #15803d;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          font-weight: 500;
          margin-left: 85px;
        }

        .view-all-link:hover {
          color: #166534;
          transform: translateX(2px);
        }

        .product-carousel-container {
          position: relative;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
          height: 600px; /* Increased from 400px to 600px */
        }

        .product-counter-overlay {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.9rem; /* Increased from 0.75rem */
          z-index: 2;
        }

        .product-carousel {
          position: relative;
          height: 100%;
        }

        .carousel-item {
          display: block !important; /* Override previous display: none */
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
        }

        .product-image-container {
          position: relative;
          width: 100%;
          height: 400px; /* Increased from 250px to 400px */
        }

        .product-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          padding: 20px; /* Increased from 10px */
        }

        .product-name {
          font-size: 1.4rem; /* Increased from 0.9rem */
          margin: 0 0 10px 0;
          font-weight: 600;
        }

        .product-price {
          font-size: 1.3rem; /* Increased from 0.9rem */
          margin: 0 0 10px 0;
          color: #15803d;
          font-weight: 600;
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
          font-size: 1rem; /* Increased from 0.7rem */
        }

        .product-description {
          font-size: 1rem; /* Increased from 0.7rem */
          line-height: 1.5;
          -webkit-line-clamp: 3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
        }

        .carousel-controls {
          position: absolute;
          top: 200px; /* Adjusted to center with new image height */
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 15px;
          pointer-events: none;
        }

        .carousel-control {
          width: 40px; /* Increased from 32px */
          height: 30px; /* Increased from 32px */
          font-size: 1.2rem; /* Increased from 1rem */
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

        @media (max-width: 1200px) {
          .seller-products-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .seller-products-container {
            grid-template-columns: 1fr;
          }
        }

        .carousel-item {
          display: block !important; /* Override previous display: none */
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

        .product-counter-overlay {
          transition: opacity 0.3s ease-in-out;
        }

        .small-title {
          font-size: 0.1rem;
          margin: -92px;
          padding: 0;
        }

        .cart-button {
          margin-top: -80px;
        }

        .product-card {
          background-color: #f0f7f0;
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(21, 128, 61, 0.15);
        }

        .product-content {
          background-color: #f0f7f0;
        }

        .product-info {
          padding: 20px;
          background-color: #f0f7f0;
        }

        .carousel-item .product-content {
          background-color: #f0f7f0;
        }
      `}</style>
    </Container>
  );
};

export default InStockProducts;
