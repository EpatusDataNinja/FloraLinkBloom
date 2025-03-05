import React, { useEffect, useState } from "react"; 
import { Button, Card, Col, Row, Container, Modal, Form, Pagination, Spinner } from "react-bootstrap";
import axios from "axios";
import { FaBox, FaDollarSign, FaCheckCircle, FaShoppingCart, FaTags, FaPhone } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Title from "../../components_part/TitleCard";
import { useNavigate } from "react-router-dom";

const InStockProducts = () => {
  const [inStock, setInStock] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 3;
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderData, setOrderData] = useState({ quantity: 1, phone: "" });
  const [loading, setLoading] = useState(false);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/instock`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInStock(response.data.data);
    } catch (error) {
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentInStock = inStock.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(inStock.length / productsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

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

    setLoading(true);  // Set loading state to true when order submission begins

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
      setLoading(false);  // Reset loading state after the order is completed
    }
  };

  // Calculate total amount to be paid
  const totalAmount = selectedProduct ? orderData.quantity * selectedProduct.price : 0;

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = existingCart.find(item => item.id === product.id);

    if (existingItem) {
      // Update quantity if item exists
      const updatedCart = existingCart.map(item => {
        if (item.id === product.id) {
          const newQuantity = Math.min(item.quantity + 1, product.quantity);
          return {
            ...item,
            quantity: newQuantity,
            availableQuantity: product.quantity
          };
        }
        return item;
      });
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      // Add new item
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        availableQuantity: product.quantity
      };
      localStorage.setItem("cart", JSON.stringify([...existingCart, cartItem]));
    }
    
    toast.success("Added to cart!");
  };

  const viewCart = () => {
    navigate("/cart");
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Title title={'In-Stock Products'}/>
        <Button variant="outline-success" onClick={viewCart}>
          <FaShoppingCart className="me-2" />
          View Cart
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row>
          {currentInStock.length > 0 ? (
            currentInStock.map((product) => (
              <Col md={4} key={product.id}>
                <Card className="mb-4 shadow-lg border-0">
                  <Card.Img variant="top" src={product.image} className="product-image" />
                  <Card.Body>
                    <Card.Title className="fw-bold">{product.name}</Card.Title>
                    <Card.Text><FaTags className="text-primary" /> Category: {product.category.name}</Card.Text>
                    <Card.Text><FaDollarSign className="text-success" /> Price: <strong>${product.price}</strong></Card.Text>
                    <Card.Text><FaBox className="text-warning" /> Available Stock: {product.quantity}</Card.Text>
                    <Card.Text><FaCheckCircle className="text-success" /> Status: {product.status}</Card.Text>
                    <Button 
                      variant="success" 
                      className="w-100"
                      onClick={() => addToCart(product)}
                      disabled={product.quantity === 0}
                    >
                      <FaShoppingCart className="me-2" />
                      Add to Cart
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-center text-muted">No in-stock products available.</p>
          )}
        </Row>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          {Array.from({ length: totalPages }, (_, index) => (
            <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

      {/* Order Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Order {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label><FaBox className="text-warning" /> Quantity</Form.Label>
              <Form.Control type="number" min="1" max={selectedProduct?.quantity} value={orderData.quantity} onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label><FaPhone className="text-primary" /> Phone Number</Form.Label>
              <Form.Control type="text" placeholder="Enter your phone number" value={orderData.phone} onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })} />
            </Form.Group>
            {/* Display Total Amount */}
            <Form.Group className="mb-3">
              <Form.Label><FaDollarSign className="text-success" /> Total Amount</Form.Label>
              <Form.Control type="text" value={`$${totalAmount}`} readOnly />
            </Form.Group>
            <Button variant="success" onClick={handleOrderSubmit} className="w-100" disabled={loading}>
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

      {/* Approval Popup */}
      <Modal show={showApprovalPopup} centered>
        <Modal.Body className="text-center">
          <h5>Please check your phone to approve the payment!</h5>
        </Modal.Body>
      </Modal>

      <ToastContainer />
    </Container>
  );
};

export default InStockProducts;
