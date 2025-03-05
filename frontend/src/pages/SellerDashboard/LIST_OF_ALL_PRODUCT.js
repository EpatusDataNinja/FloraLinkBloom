import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Container, Pagination, Nav, Tab, Modal, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa'; // Add icons for no data
import Title from "../../components_part/TitleCard";
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

  // Fetch In Stock Products
  const fetchInStock = async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found! Please login.");
        return;
      }

      console.log('Fetching in-stock products...');
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/instock`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('In-stock response:', response.data);
      if (response.data && response.data.data) {
        // Filter and map the products
        const products = response.data.data.map(product => ({
          ...product,
          status: product.status || "In Stock"
        }));
        setInStock(products);
      } else {
        console.error("Invalid response format:", response);
        toast.error("Error loading in-stock products");
      }
    } catch (error) {
      console.error("Error fetching in-stock products:", error);
      if (error.response?.status === 404) {
        setInStock([]);
      } else {
        toast.error(error.response?.data?.message || "Failed to load in-stock products");
      }
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
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Out-of-stock response:', response.data);
      if (response.data && response.data.data) {
        // Filter out-of-stock and rejected products
        const products = response.data.data
          .filter(product => product.quantity === 0 || product.status === "rejected")
          .map(product => ({
            ...product,
            status: product.status === "rejected" ? "Rejected" : "Out of Stock"
          }));
        setOutOfStock(products);
      } else {
        console.error("Invalid response format:", response);
        toast.error("Error loading out-of-stock products");
      }
    } catch (error) {
      console.error("Error fetching out-of-stock products:", error);
      if (error.response?.status === 404) {
        setOutOfStock([]);
      } else {
        toast.error(error.response?.data?.message || "Failed to load out-of-stock products");
      }
    }
  };

  useEffect(() => {
    fetchInStock();
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

    // Don't allow updating rejected products
    if (selectedProduct.status === "rejected") {
      toast.error("Cannot update rejected products");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      setLoading(true);
      console.log('Selected product details:', selectedProduct);
      console.log('Updating product:', selectedProduct.id, 'with quantity:', quantity);

      // Create update payload matching backend requirements
      const updatePayload = {
        name: selectedProduct.name.toUpperCase(),
        description: selectedProduct.description,
        price: selectedProduct.price,
        quantity: quantity,
        categoryID: selectedProduct.categoryID,
        userID: selectedProduct.userID,
        image: selectedProduct.image,
        status: quantity > 0 ? 'In Stock' : 'Out of Stock'
      };

      console.log('Final update payload:', JSON.stringify(updatePayload, null, 2));

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/v1/product/update/${selectedProduct.id}`,
        updatePayload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
    
      console.log('Full update response:', response);

      if (response.data && response.data.success) {
        toast.success("Stock updated successfully!");
        setShowUpdateModal(false);
        
        // Dispatch event for stock update
        const event = new CustomEvent('productStockUpdate', {
          detail: {
            productId: selectedProduct.id,
            newQuantity: quantity,
            action: 'update'
          }
        });
        window.dispatchEvent(event);
        
        // Refresh the lists to get updated data
        await Promise.all([fetchInStock(), fetchOutOfStock()]);
      } else {
        throw new Error(response.data?.message || "Update failed");
      }
    } catch (error) {
      console.error('Full error details:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        status: error.response?.status,
        responseData: error.response?.data,
        errorMessage: error.message
      });
      const errorMessage = error.response?.data?.message || error.message || "Failed to update stock";
      toast.error(errorMessage);
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
        <Card.Img variant="top" src={product.image} />
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
            variant="outline-primary" 
            className="mt-2"
            onClick={() => openUpdateModal(product)}
            disabled={product.status === "rejected" || product.status === "Pending Approval"}
          >
            {product.status === "rejected" ? 'Product Rejected' :
             product.status === "Pending Approval" ? 'Awaiting Approval' :
             'Update Stock'}
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container>
       <Title title={'List Products'}/>

      <Tab.Container defaultActiveKey="outofstock">
        <Nav variant="pills" className="mb-4 justify-content-center">
          <Nav.Item>
            <Nav.Link eventKey="outofstock">Out of Stock</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="instock">In Stock</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Out of Stock Products Panel */}
          <Tab.Pane eventKey="outofstock">
            <Row>
              {currentOutOfStock.length > 0 ? (
                currentOutOfStock.map(renderProductCard)
              ) : (
                <NoDataCard message="No out-of-stock products available." icon={<FaBoxOpen />} />
              )}
            </Row>

            <Pagination className="justify-content-center">
              {Array.from({ length: outTotalPages }, (_, index) => (
                <Pagination.Item key={index + 1} active={index + 1 === outCurrentPage} onClick={() => handleOutPageChange(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Tab.Pane>

          {/* In Stock Products Panel */}
          <Tab.Pane eventKey="instock">
            <Row>
              {currentInStock.length > 0 ? (
                currentInStock.map(renderProductCard)
              ) : (
                <NoDataCard message="No in-stock products available." icon={<FaBoxOpen />} />
              )}
            </Row>

            <Pagination className="justify-content-center">
              {Array.from({ length: inTotalPages }, (_, index) => (
                <Pagination.Item key={index + 1} active={index + 1 === inCurrentPage} onClick={() => handleInPageChange(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
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
    </Container>
  );
};

export default ProductPanel;
