import React, { useState, useEffect, useCallback } from "react";
import { Container, Card, Row, Col, Button, Image } from "react-bootstrap";
import { FaTrash, FaArrowRight, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Title from "../../components_part/TitleCard";
import axios from "axios";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to check if adding a new product is allowed
  const canAddToCart = (newProduct, existingItems) => {
    if (existingItems.length === 0) return true;
    
    // Get the seller ID of the first item in cart
    const currentSellerId = existingItems[0].sellerId;
    
    // Check if new product is from the same seller
    if (newProduct.sellerId !== currentSellerId) {
      toast.error(
        <div>
          <p>Cannot add products from different sellers to cart.</p>
          <p>Please complete or clear your current cart first.</p>
          <p>Current cart has items from: {existingItems[0].sellerName}</p>
        </div>,
        {
          autoClose: 5000,
          position: "top-center"
        }
      );
      return false;
    }
    return true;
  };

  // Load cart items from localStorage and validate with server data
  const loadCartItems = useCallback(async () => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      if (savedCart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view your cart");
        navigate("/login");
        return;
      }

      // Fetch all approved products to get current data
      const productsResponse = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            
      if (!productsResponse.data.data) {
        throw new Error('Failed to fetch product data');
      }

      const currentProducts = productsResponse.data.data;

      // Update cart items with current product data
      const updatedCart = savedCart.map(cartItem => {
        const currentProduct = currentProducts.find(p => p.id === cartItem.id);
        if (!currentProduct) {
          toast.error(`${cartItem.name} is no longer available`);
          return null;
        }

        return {
          ...cartItem,
          availableQuantity: currentProduct.quantity || 0,
          quantity: Math.min(cartItem.quantity, currentProduct.quantity || 0),
          price: currentProduct.price,
          sellerId: currentProduct.userID,
          sellerName: `${currentProduct.firstname} ${currentProduct.lastname}`.trim(),
          image: currentProduct.image
        };
      }).filter(item => item !== null);

      // Remove unavailable items
      if (updatedCart.length !== savedCart.length) {
        toast.info('Some items in your cart are no longer available');
      }

      if (updatedCart.length === 0) {
        localStorage.setItem("cart", "[]");
        setCartItems([]);
        setLoading(false);
        return;
      }

      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      // Import any guest cart items if they exist
      const tempGuestCart = sessionStorage.getItem("tempGuestCart");
      if (tempGuestCart) {
        const guestItems = JSON.parse(tempGuestCart);
        if (guestItems.length > 0) {
          // Check if guest items are from the same seller
          if (updatedCart.length === 0 || canAddToCart(guestItems[0], updatedCart)) {
            const guestItemsWithData = guestItems.map(guestItem => {
              const productData = currentProducts.find(p => p.id === guestItem.id);
              if (!productData) return null;
              
              return {
                ...guestItem,
                availableQuantity: productData.quantity || 0,
                quantity: Math.min(guestItem.quantity, productData.quantity || 0),
                price: productData.price,
                sellerId: productData.userID,
                sellerName: `${productData.firstname} ${productData.lastname}`.trim(),
                image: productData.image
              };
            }).filter(item => item !== null);

            const combinedCart = [...updatedCart, ...guestItemsWithData];
            setCartItems(combinedCart);
            localStorage.setItem("cart", JSON.stringify(combinedCart));
          }
        }
        // Clear the temporary guest cart
        sessionStorage.removeItem("tempGuestCart");
      }
    } catch (error) {
      console.error("Error loading cart items:", error);
      toast.error("Error loading cart items. Please try again.");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Export the canAddToCart function so it can be used in other components
  window.canAddToCart = (newProduct) => canAddToCart(newProduct, cartItems);

  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  // Handle quantity updates for a product
  const handleQuantityUpdate = async (productId, change) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to update cart");
        navigate("/login");
        return;
      }

      // Find the current item in the cart
      const currentItem = cartItems.find(item => item.id === productId);
      if (!currentItem) {
        toast.error("Product not found in cart");
        return;
      }

      // Calculate new quantity
      const newQuantity = currentItem.quantity + change;

      // Validate new quantity
      if (newQuantity < 1) {
        toast.warning("Quantity cannot be less than 1");
        return;
      }

      // Fetch latest product data
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const productData = response.data.data.find(p => p.id === productId);
      if (!productData) {
        toast.error("Product is no longer available");
        removeItem(productId);
        return;
      }

      // Validate against server quantity
      if (newQuantity > productData.quantity) {
        toast.warning(`Only ${productData.quantity} items available in stock`);
        return;
      }

      // Update the cart
      const updatedCart = cartItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity, availableQuantity: productData.quantity }
          : item
      );

      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.success(`Updated ${currentItem.name} quantity to ${newQuantity}`);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  // Remove an item from the cart
  const removeItem = (productId) => {
    try {
      const itemToRemove = cartItems.find(item => item.id === productId);
      const updatedCart = cartItems.filter(item => item.id !== productId);
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.success(`${itemToRemove.name} removed from cart`);
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Error removing item from cart");
    }
  };

  // Calculate the total price of items in the cart
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    navigate("/checkout");
  };

  // Loading state
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
      <Title title="Shopping Cart" />
      
      {cartItems.length > 0 && (
        <div className="mb-3">
          <Card className="bg-light">
            <Card.Body>
              <h6 className="mb-0">
                Current Seller: <span className="text-success">{cartItems[0].sellerName}</span>
              </h6>
            </Card.Body>
          </Card>
        </div>
      )}
      
      {cartItems.length === 0 ? (
        <Card className="text-center p-5 shadow-sm">
          <Card.Body>
            <div className="mb-4">
              <FaShoppingCart size={50} className="text-muted" />
            </div>
            <h3 className="mb-3">Your cart is empty</h3>
            <p className="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
            <Button 
              variant="success" 
              onClick={() => navigate("/products")}
              className="rounded-pill px-4 py-2"
            >
              Continue Shopping
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row>
            <Col md={8}>
              {cartItems.map((item) => (
                <Card key={item.id} className="mb-3 shadow-sm">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col md={2}>
                        <div className="product-image-container">
                          <Image 
                            src={`${process.env.REACT_APP_BASE_URL}${item.image}`} 
                            alt={item.name} 
                            fluid 
                            className="rounded" 
                          />
                        </div>
                      </Col>
                      <Col md={4}>
                        <h5 className="mb-1">{item.name}</h5>
                        <div className="text-success">
                          <strong>${item.price}</strong>
                        </div>
                        {item.availableQuantity < 5 && (
                          <small className="text-danger">
                            Only {item.availableQuantity} left in stock!
                          </small>
                        )}
                      </Col>
                      <Col md={3}>
                        <div className="d-flex align-items-center justify-content-center">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleQuantityUpdate(item.id, -1)}
                            disabled={item.quantity <= 1}
                            style={{ cursor: 'pointer' }}
                            className="quantity-btn"
                          >
                            <FaMinus />
                          </Button>
                          <span className="mx-3">{item.quantity}</span>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleQuantityUpdate(item.id, 1)}
                            disabled={item.quantity >= item.availableQuantity}
                            style={{ cursor: 'pointer' }}
                            className="quantity-btn"
                          >
                            <FaPlus />
                          </Button>
                        </div>
                        {item.availableQuantity < 5 && (
                          <small className="text-danger d-block text-center mt-2">
                            Only {item.availableQuantity} left in stock!
                          </small>
                        )}
                      </Col>
                      <Col md={2}>
                        <div className="text-success text-end">
                          <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                        </div>
                      </Col>
                      <Col md={1}>
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
                </Card>
              ))}
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
                    onClick={proceedToCheckout}
                  >
                    Proceed to Checkout <FaArrowRight className="ms-2" />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <style jsx="true">{`
            .product-image-container {
              width: 100%;
              padding-top: 100%;
              position: relative;
              overflow: hidden;
              border-radius: 8px;
            }
            .product-image-container img {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .quantity-btn {
              width: 32px !important;
              height: 32px !important;
              padding: 0 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              border-radius: 50% !important;
              cursor: pointer !important;
              z-index: 1 !important;
              position: relative !important;
            }
            .quantity-btn:not(:disabled) {
              background-color: #fff !important;
              border-color: #15803d !important;
              color: #15803d !important;
            }
            .quantity-btn:not(:disabled):hover {
              background-color: #15803d !important;
              border-color: #15803d !important;
              color: white !important;
            }
            .quantity-btn:disabled {
              opacity: 0.5 !important;
              cursor: not-allowed !important;
              background-color: #e9ecef !important;
              border-color: #dee2e6 !important;
            }
          `}</style>
        </>
      )}
      <ToastContainer />
    </Container>
  );
};

export default Cart;