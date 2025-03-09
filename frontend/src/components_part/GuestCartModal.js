import React, { useState, useEffect } from 'react';
import { Modal, Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaSignInAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const GuestCartModal = ({ show, onHide }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load guest cart items and validate with server data
  const loadGuestCartItems = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (token) {
        // If authenticated, clear guest cart and close modal
        localStorage.removeItem("guestCart");
        onHide();
        navigate('/cart');
        return;
      }

      const savedCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      
      if (savedCart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Fetch updated product details from the server
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`);
      const currentProducts = response.data.data;

      const updatedCart = savedCart.map(item => {
        const productData = currentProducts.find(p => p.id === item.id);
        if (!productData) return null;

        return {
          ...item,
          availableQuantity: productData.quantity || 0,
          quantity: Math.min(item.quantity, productData.quantity || 0),
          price: productData.price || item.price,
          image: productData.image || item.image,
          sellerName: `${productData.firstname} ${productData.lastname}`
        };
      }).filter(item => item !== null);

      setCartItems(updatedCart);
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error loading guest cart items:", error);
      toast.error("Error loading cart items");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      loadGuestCartItems();
    }
  }, [show]);

  const handleQuantityUpdate = (productId, change) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity < 1 || newQuantity > item.availableQuantity) {
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCartItems(updatedCart);
    localStorage.setItem("guestCart", JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    toast.success("Item removed from cart");
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleLogin = () => {
    // Store current cart items in temporary storage
    if (cartItems.length > 0) {
      sessionStorage.setItem("tempGuestCart", JSON.stringify(cartItems));
    }
    onHide();
    navigate("/login", { 
      state: { 
        returnUrl: '/cart',
        message: 'Please sign in to complete your purchase'
      }
    });
  };

  // Group items by seller
  const itemsBySeller = cartItems.reduce((acc, item) => {
    const sellerName = item.sellerName || 'Unknown Seller';
    if (!acc[sellerName]) {
      acc[sellerName] = [];
    }
    acc[sellerName].push(item);
    return acc;
  }, {});

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="guest-cart-modal"
      centered
      dialogClassName="guest-cart-modal"
    >
      <Modal.Header closeButton className="border-0 bg-success text-white">
        <Modal.Title id="guest-cart-modal" className="fs-4">
          <FaShoppingCart className="me-2" /> Shopping Cart
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-5">
            <FaShoppingCart size={48} className="text-success mb-3" />
            <h4 className="mb-3">Your cart is empty</h4>
            <p className="text-muted mb-4">Start shopping to add items to your cart!</p>
            <Button variant="success" onClick={onHide} className="px-4 py-2 rounded-pill">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <Container fluid className="px-4 py-3">
            <Row>
              <Col lg={8}>
                {Object.entries(itemsBySeller).map(([sellerName, items]) => (
                  <div key={sellerName} className="mb-4">
                    <Card className="border-0 shadow-sm hover-card">
                      <Card.Header className="bg-light border-0 py-3">
                        <h6 className="mb-0 text-success">Seller: {sellerName}</h6>
                      </Card.Header>
                      {items.map((item) => (
                        <Card.Body key={item.id} className="border-top py-3">
                          <Row className="align-items-center g-3">
                            <Col xs={12} md={2}>
                              <Image
                                src={item.image.startsWith('http') ? item.image : `${process.env.REACT_APP_BASE_URL}${item.image}`}
                                alt={item.name}
                                fluid
                                className="rounded shadow-sm"
                                style={{ height: '80px', width: '100%', objectFit: 'cover' }}
                              />
                            </Col>
                            <Col xs={12} md={4}>
                              <h6 className="mb-1 text-success">{item.name}</h6>
                              {item.availableQuantity < 5 && (
                                <small className="text-danger">
                                  Only {item.availableQuantity} left!
                                </small>
                              )}
                            </Col>
                            <Col xs={6} md={2}>
                              <div className="d-flex align-items-center quantity-controls">
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.id, -1)}
                                  disabled={item.quantity <= 1}
                                  className="rounded-circle"
                                >
                                  <FaMinus />
                                </Button>
                                <span className="mx-2 fw-bold">{item.quantity}</span>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.id, 1)}
                                  disabled={item.quantity >= item.availableQuantity}
                                  className="rounded-circle"
                                >
                                  <FaPlus />
                                </Button>
                              </div>
                            </Col>
                            <Col xs={4} md={3} className="text-end">
                              <div className="fw-bold text-success">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                              <small className="text-muted">
                                ${item.price.toFixed(2)} each
                              </small>
                            </Col>
                            <Col xs={2} md={1} className="text-end">
                              <Button
                                variant="link"
                                className="text-danger p-0"
                                onClick={() => removeItem(item.id)}
                              >
                                <FaTrash />
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      ))}
                    </Card>
                  </div>
                ))}
              </Col>
              <Col lg={4}>
                <Card className="border-0 shadow-sm sticky-top" style={{ top: '1rem' }}>
                  <Card.Body className="p-4">
                    <h5 className="mb-4 text-success">Order Summary</h5>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Subtotal</span>
                      <span className="fw-bold">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Shipping</span>
                      <span className="text-success">Free</span>
                    </div>
                    <hr className="my-4" />
                    <div className="d-flex justify-content-between mb-4">
                      <strong>Total</strong>
                      <strong className="text-success fs-5">
                        ${calculateTotal().toFixed(2)}
                      </strong>
                    </div>
                    <Button
                      variant="success"
                      className="w-100 mb-3 py-2 rounded-pill"
                      onClick={handleLogin}
                    >
                      Sign In to Checkout <FaSignInAlt className="ms-2" />
                    </Button>
                    <Button
                      variant="outline-success"
                      className="w-100 py-2 rounded-pill"
                      onClick={onHide}
                    >
                      Continue Shopping
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        )}
      </Modal.Body>

      <style jsx="true">{`
        .guest-cart-modal {
          max-width: 95%;
          width: 1200px;
          margin: 1.75rem auto;
        }

        .hover-card {
          transition: all 0.3s ease;
        }

        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
        }

        .quantity-controls button {
          width: 28px;
          height: 28px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quantity-controls button:focus {
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .guest-cart-modal {
            width: 95%;
            margin: 1rem auto;
          }
        }
      `}</style>
    </Modal>
  );
};

export default GuestCartModal; 