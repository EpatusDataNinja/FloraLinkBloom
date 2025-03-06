import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Container, Pagination, Nav, Tab, Modal, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa'; // Add icons for no data
import Title from "../../components_part/TitleCard";
import { useNavigate } from "react-router-dom";

const NoDataCard = ({ message, icon }) => (
  <Col className="text-center">
    <Card className="shadow-sm border-0 rounded p-4">
      <Card.Body>
        <div className="mb-3">
          <FaExclamationTriangle size={50} color="gray" />
        </div>
        <Card.Title>No Data Available</Card.Title>
        <Card.Text>{message}</Card.Text>
      </Card.Body>
    </Card>
  </Col>
);

const ProductPanel = () => {
  const [outOfStock, setOutOfStock] = useState([]);
  const [inStock, setInStock] = useState([]);
  const [outCurrentPage, setOutCurrentPage] = useState(1);
  const [inCurrentPage, setInCurrentPage] = useState(1);
  const productsPerPage = 3;
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch In Stock Products
  const fetchInStockProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Fetching in-stock products...');
      console.log('Token:', token);
      
      const response = await axios({
        method: 'GET',
        url: `${process.env.REACT_APP_BASE_URL}/api/v1/product/instock`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      console.log('Response:', response.data);

      if (response.data.success) {
        setInStock(response.data.data || []); // Ensure we set an empty array if data is null
      } else {
        throw new Error(response.data.message || 'Failed to fetch in-stock products');
      }
    } catch (error) {
      console.error('Fetch error details:', error);
      setError(error.message || 'Failed to fetch in-stock products');
      toast.error(error.message || 'Failed to fetch in-stock products');
      setInStock([]); 
    } finally {
      setLoading(false);
    }
  };

  // Fetch Out of Stock Products
  const fetchOutOfStock = async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      console.log('Fetching out-of-stock products...');
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/outofstock`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Out-of-stock response:', response.data);
      if (response.data.success) {
        setOutOfStock(response.data.data || []);
      } else {
        console.error("Invalid response format:", response);
        toast.error("Error loading out-of-stock products");
      }
    } catch (error) {
      console.error("Error fetching out-of-stock products:", error);
      setOutOfStock([]);
      toast.error(error.response?.data?.message || "Failed to load out-of-stock products");
    }
  };

  useEffect(() => {
    fetchInStockProducts();
    fetchOutOfStock();
  }, []);

  // Add event listener for stock updates
  useEffect(() => {
    const handleStockUpdate = (event) => {
      const { productId, newQuantity, action } = event.detail;
      
      if (action === 'update') {
        // Update both inStock and outOfStock lists
        setInStock(prev => prev.map(product => 
          product.id === productId 
            ? { ...product, quantity: newQuantity, status: newQuantity > 0 ? 'in stock' : 'out of stock' }
            : product
        ));
        setOutOfStock(prev => prev.map(product => 
          product.id === productId 
            ? { ...product, quantity: newQuantity, status: newQuantity > 0 ? 'in stock' : 'out of stock' }
            : product
        ));

        // Move product between lists if necessary
        if (newQuantity > 0) {
          moveToInStock(productId);
        } else {
          moveToOutOfStock(productId);
        }
      }
    };

    window.addEventListener('productStockUpdate', handleStockUpdate);
    return () => window.removeEventListener('productStockUpdate', handleStockUpdate);
  }, []);

  const moveToInStock = (productId) => {
    const product = outOfStock.find(p => p.id === productId);
    if (product) {
      setOutOfStock(prev => prev.filter(p => p.id !== productId));
      setInStock(prev => [...prev, { ...product, status: 'in stock' }]);
    }
  };

  const moveToOutOfStock = (productId) => {
    const product = inStock.find(p => p.id === productId);
    if (product) {
      setInStock(prev => prev.filter(p => p.id !== productId));
      setOutOfStock(prev => [...prev, { ...product, status: 'out of stock' }]);
    }
  };

  const handleQuickUpdate = async () => {
    if (!selectedProduct || newQuantity === "") {
      toast.error("Please enter a valid quantity");
      return;
    }

    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) {
      toast.error("Please enter a valid non-negative quantity");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      setLoading(true);

      // Create update payload
      const updatePayload = {
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        quantity: quantity,
        categoryID: selectedProduct.category?.id || selectedProduct.categoryID,
        status: selectedProduct.status, // Keep the existing status
        image: selectedProduct.image
      };

      const response = await axios({
        method: 'PUT',
        url: `${process.env.REACT_APP_BASE_URL}/api/v1/product/update/${selectedProduct.id}`,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: updatePayload
      });

      if (response.data.success) {
        toast.success("Stock quantity updated successfully!");
        setShowUpdateModal(false);
        
        // Refresh both lists to get the latest data
        await Promise.all([
          fetchInStockProducts(),
          fetchOutOfStock()
        ]);
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || error.message || "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };
  
  const openUpdateModal = (product) => {
    setSelectedProduct(product);
    setNewQuantity(product.quantity.toString());
    setShowUpdateModal(true);
  };

  // Pagination Logic for Out of Stock Products
  const outIndexOfLastProduct = outCurrentPage * productsPerPage;
  const outIndexOfFirstProduct = outIndexOfLastProduct - productsPerPage;
  const currentOutOfStock = outOfStock.slice(outIndexOfFirstProduct, outIndexOfLastProduct);
  const outTotalPages = Math.ceil(outOfStock.length / productsPerPage);

  const handleOutPageChange = (page) => {
    setOutCurrentPage(page);
  };

  // Pagination Logic for In Stock Products
  const inIndexOfLastProduct = inCurrentPage * productsPerPage;
  const inIndexOfFirstProduct = inIndexOfLastProduct - productsPerPage;
  const currentInStock = inStock.slice(inIndexOfFirstProduct, inIndexOfLastProduct);
  const inTotalPages = Math.ceil(inStock.length / productsPerPage);

  const handleInPageChange = (page) => {
    setInCurrentPage(page);
  };

  // Modify the product card render to include quick update button
  const renderProductCard = (product) => (
    <Col md={4} key={product.id}>
      <Card className="mb-4 shadow-lg">
        <Card.Img 
          variant="top" 
          src={product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_BASE_URL}${product.image}`}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
          alt={product.name}
        />
        <Card.Body>
          <Card.Title>{product.name}</Card.Title>
          <Card.Text>{product.description}</Card.Text>
          <Card.Text>Price: ${product.price}</Card.Text>
          <Card.Text>
            Stock: <strong>{product.quantity}</strong>
          </Card.Text>
          <Card.Text>
            Status: <strong className={
              product.status === "In Stock" ? "text-success" :
              product.status === "Out of Stock" ? "text-danger" :
              product.status === "Pending Approval" ? "text-warning" :
              "text-danger"
            }>{product.status}</strong>
          </Card.Text>
          <Button 
            variant="primary" 
            className="mt-2 me-2"
            onClick={() => handleEditProduct(product)}
          >
            Edit Product
          </Button>
          <Button 
            variant="outline-primary" 
            className="mt-2"
            onClick={() => openUpdateModal(product)}
            disabled={product.status === "rejected"}
          >
            Quick Update Stock
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );

  // Add a retry mechanism
  const handleRetry = () => {
    fetchInStockProducts();
  };

  const handleEditProduct = (product) => {
    navigate("/dashboard/seller/add-product", { 
      state: { 
        editMode: true, 
        productData: product,
        returnUrl: window.location.pathname // Store the current path
      }
    });
  };

  return (
    <Container>
       <Title title={'List Products'}/>

      <Tab.Container defaultActiveKey="outofstock">
        <Nav variant="pills" className="mb-4 justify-content-center">
          <Nav.Item>
            <Nav.Link eventKey="outofstock">Out of Stock ({outOfStock.length})</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="instock">In Stock ({inStock.length})</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Out of Stock Products Panel */}
          <Tab.Pane eventKey="outofstock">
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" />
              </div>
            ) : (
              <>
                <Row>
                  {outOfStock.length > 0 ? (
                    outOfStock.map((product) => renderProductCard(product))
                  ) : (
                    <NoDataCard 
                      message="No out-of-stock products available." 
                      icon={<FaBoxOpen />} 
                    />
                  )}
                </Row>

                {outOfStock.length > 0 && (
                  <Pagination className="justify-content-center">
                    {Array.from({ length: Math.ceil(outOfStock.length / productsPerPage) }, (_, index) => (
                      <Pagination.Item 
                        key={index + 1} 
                        active={index + 1 === outCurrentPage} 
                        onClick={() => handleOutPageChange(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                )}
              </>
            )}
          </Tab.Pane>

          {/* In Stock Products Panel */}
          <Tab.Pane eventKey="instock">
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" />
              </div>
            ) : (
              <>
                <Row>
                  {inStock.length > 0 ? (
                    inStock.map((product) => renderProductCard(product))
                  ) : (
                    <NoDataCard 
                      message="No in-stock products available." 
                      icon={<FaBoxOpen />} 
                    />
                  )}
                </Row>

                {inStock.length > 0 && (
                  <Pagination className="justify-content-center">
                    {Array.from({ length: Math.ceil(inStock.length / productsPerPage) }, (_, index) => (
                      <Pagination.Item 
                        key={index + 1} 
                        active={index + 1 === inCurrentPage} 
                        onClick={() => handleInPageChange(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                )}
              </>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Quick Update Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Product Name</Form.Label>
              <Form.Control type="text" value={selectedProduct?.name || ''} disabled />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Current Stock: {selectedProduct?.quantity || 0}</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                placeholder="Enter new quantity"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleQuickUpdate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Update Stock'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />

      {loading && <div>Loading...</div>}
      
      {error && (
        <div className="alert alert-danger">
          {error}
          <button 
            className="btn btn-link"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      )}
    </Container>
  );
};

export default ProductPanel;
