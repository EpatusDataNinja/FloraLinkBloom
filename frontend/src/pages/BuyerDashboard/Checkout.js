import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Button, Form, Spinner, Offcanvas } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaTimes, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import Title from "../../components_part/TitleCard";

const Checkout = ({ setShowMainSidebar }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (setShowMainSidebar) {
      setShowMainSidebar(false);
    }
  }, [setShowMainSidebar]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First check if cart exists and has items
        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        if (savedCart.length === 0) {
          toast.error("Your cart is empty");
          navigate("/cart");
          return;
        }

        // Then check authentication and get user data
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (!token || !userData) {
          toast.error("Please login to continue");
          navigate("/login");
          return;
        }

        try {
          // Get user data from localStorage
          const user = JSON.parse(userData);
          console.log("User data from localStorage:", user);
          
          if (!user || !user.id) {
            throw new Error('Invalid user data');
          }

          // Fetch latest user data from server
          const userResponse = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/v1/users/${user.id}`,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );

          console.log("User response:", userResponse);

          // Check if response has data property
          if (!userResponse.data) {
            throw new Error('Invalid response from server');
          }

          // Use the response data directly since it contains the user information
          const serverUserData = userResponse.data;
          console.log("Server user data:", serverUserData);

          // Combine localStorage user data with server data, preferring server data
          const combinedUserData = {
            ...user,
            ...serverUserData,
            // Ensure we have these critical fields for checkout
            firstname: serverUserData.firstname || user.firstname,
            lastname: serverUserData.lastname || user.lastname,
            email: serverUserData.email || user.email,
            phone: serverUserData.phone || user.phone,
            address: serverUserData.address || user.address
          };

          console.log("Combined user data:", combinedUserData);
          setUserProfile(combinedUserData);

          // Validate cart items with server
          const cartPromises = savedCart.map(async (item) => {
            try {
              const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/v1/product/one/${item.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` }
                }
              );
              
              if (!response.data || !response.data.data) {
                console.error(`Product ${item.id} not found`);
                return null;
              }

              const serverProduct = response.data.data;
              
              if (serverProduct.quantity < item.quantity) {
                toast.warning(`Only ${serverProduct.quantity} ${item.name} available`);
                return {
                  ...item,
                  quantity: Math.min(item.quantity, serverProduct.quantity),
                  price: serverProduct.price
                };
              }

              return {
                ...item,
                price: serverProduct.price,
                status: serverProduct.status
              };
            } catch (error) {
              console.error(`Error fetching product ${item.id}:`, error);
              return null;
            }
          });

          const resolvedCart = await Promise.all(cartPromises);
          const validCart = resolvedCart.filter(item => item !== null);

          if (validCart.length === 0) {
            toast.error("No valid items in cart");
            navigate("/cart");
            return;
          }

          setCartItems(validCart);
          localStorage.setItem("cart", JSON.stringify(validCart));

        } catch (error) {
          console.error("Error fetching user data:", error);
          console.error("Full error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.config?.headers
          });

          if (error.response?.status === 401) {
            toast.error("Session expired. Please login again");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          } else {
            toast.error(`Error loading user data: ${error.message}`);
            navigate("/cart");
          }
          return;
        }

      } catch (error) {
        console.error("Error in checkout:", error);
        toast.error(error.message || "Error processing checkout");
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      
      // Create orders for each cart item
      for (const item of cartItems) {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/api/v1/order/add`,
          {
            productID: item.id,
            quantity: item.quantity,
            number: userProfile.phone,
            shippingAddress: userProfile.address
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      // Clear cart after successful order
      localStorage.removeItem("cart");
      toast.success("Orders placed successfully!");
      
      // Redirect to orders page after a short delay
      setTimeout(() => {
        navigate("/buyer/orders");
      }, 2000);
    } catch (error) {
      toast.error("Error placing orders: " + error.message);
    } finally {
      setProcessing(false);
      setShowSidebar(false);
    }
  };

  const handleClose = () => {
    navigate("/cart");
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Title title="Checkout" />
        <Button 
          variant="link" 
          className="text-danger close-button" 
          onClick={handleClose}
        >
          <FaTimes size={24} />
        </Button>
      </div>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Shipping Information</h4>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={userProfile?.firstname || ""}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={userProfile?.lastname || ""}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={userProfile?.email || ""}
                    disabled
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={userProfile?.phone || ""}
                    disabled
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Shipping Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={userProfile?.address || ""}
                    disabled
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Order Items</h4>
              {cartItems.map((item) => (
                <Row key={item.id} className="mb-3 align-items-center">
                  <Col md={2}>
                    <img 
                      src={`${process.env.REACT_APP_BASE_URL}${item.image}`} 
                      alt={item.name} 
                      className="img-fluid rounded" 
                    />
                  </Col>
                  <Col md={4}>
                    <h6 className="mb-0">{item.name}</h6>
                    <small className="text-muted">Quantity: {item.quantity}</small>
                  </Col>
                  <Col md={3}>
                    <span>${item.price} each</span>
                  </Col>
                  <Col md={3} className="text-end">
                    <strong className="text-success">${(item.price * item.quantity).toFixed(2)}</strong>
                  </Col>
                </Row>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Order Summary</h4>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total</strong>
                <strong className="text-success">${calculateTotal().toFixed(2)}</strong>
              </div>
              <Button
                variant="success"
                className="w-100 rounded-pill"
                onClick={() => setShowSidebar(true)}
                disabled={processing || cartItems.length === 0}
              >
                Proceed to Payment <FaArrowRight className="ms-2" />
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Checkout Sidebar */}
      <Offcanvas 
        show={showSidebar} 
        onHide={() => setShowSidebar(false)} 
        placement="end"
        className="checkout-sidebar"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Complete Your Order</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Card className="border-0">
            <Card.Body>
              <h5 className="mb-4">Order Summary</h5>
              {cartItems.map((item) => (
                <div key={item.id} className="mb-3">
                  <div className="d-flex align-items-center">
                    <img 
                      src={`${process.env.REACT_APP_BASE_URL}${item.image}`} 
                      alt={item.name} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }} 
                    />
                    <div>
                      <div className="d-flex justify-content-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <strong>Total</strong>
                <strong className="text-success">${calculateTotal().toFixed(2)}</strong>
              </div>
              
              <Button
                variant="success"
                className="w-100 rounded-pill mb-3"
                onClick={handlePlaceOrder}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  "Confirm Order"
                )}
              </Button>
              <Button
                variant="outline-secondary"
                className="w-100 rounded-pill"
                onClick={() => setShowSidebar(false)}
                disabled={processing}
              >
                Continue Shopping
              </Button>
            </Card.Body>
          </Card>
        </Offcanvas.Body>
      </Offcanvas>

      <style jsx="true">{`
        .close-button {
          padding: 0;
          margin: 0;
          line-height: 1;
        }
        .close-button:hover {
          opacity: 0.7;
        }
        .checkout-sidebar {
          width: 400px;
        }
        .checkout-sidebar .card {
          box-shadow: none;
        }
        @media (max-width: 576px) {
          .checkout-sidebar {
            width: 100%;
          }
        }
      `}</style>

      <ToastContainer />
    </Container>
  );
};

export default Checkout; 