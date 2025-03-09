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
      setInStock(prev => [...prev, { ...product, status: 'In Stock' }]);
    }
  };

  const moveToOutOfStock = (productId) => {
    const product = inStock.find(p => p.id === productId);
    if (product) {
      setInStock(prev => prev.filter(p => p.id !== productId));
      setOutOfStock(prev => [...prev, { ...product, status: 'Out of Stock' }]);
    }
  };

  const handleQuickUpdate = async () => {
    if (!selectedProduct || newQuantity === "") {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Create a complete product update payload
      const updatePayload = {
        name: selectedProduct.name,
        categoryID: selectedProduct.category?.id || selectedProduct.categoryID,
        description: selectedProduct.description,
        price: selectedProduct.price,
        quantity: parseInt(newQuantity),
        status: parseInt(newQuantity) > 0 ? 'In Stock' : 'Out of Stock'
      };

      console.log('Update payload:', updatePayload); // Debug log

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

      if (response.data.success) {
        // Update local state
        setInStock(prev =>
          prev.map(product =>
            product.id === selectedProduct.id
              ? { ...product, quantity: parseInt(newQuantity), status: parseInt(newQuantity) > 0 ? 'In Stock' : 'Out of Stock' }
              : product
          )
        );
        setOutOfStock(prev =>
          prev.map(product =>
            product.id === selectedProduct.id
              ? { ...product, quantity: parseInt(newQuantity), status: parseInt(newQuantity) > 0 ? 'In Stock' : 'Out of Stock' }
              : product
          )
        );
        toast.success("Product updated successfully");
        setShowUpdateModal(false);
        setNewQuantity("");
      } else {
        toast.error(response.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
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
  const renderProductCard = (product) =>
    <Col md={4} key={product.id}>
      <Card className="mb-4 shadow-lg">
        <Card.Img 
          variant="top" 
          src={product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_BASE_URL}${product.image}`}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
          alt={product.name}
          style={{
            height: "250px",
            objectFit: "cover",
            width: "100%"
          }}
        />
        <Card.Body style={{ height: "280px", overflow: "hidden" }}>
          <Card.Title className="text-truncate">{product.name}</Card.Title>
          <Card.Text style={{ height: "48px", overflow: "hidden" }}>{product.description}</Card.Text>
          <Card.Text className="mb-2">Price: <strong className="text-success">${product.price}</strong></Card.Text>
          <Card.Text className="mb-2">
            Stock: <strong>{product.quantity}</strong>
          </Card.Text>
          <Card.Text className="mb-3">
            Status: <strong className={
              product.status === "In Stock" ? "text-success" :
              product.status === "Out of Stock" ? "text-danger" :
              product.status === "Pending Approval" ? "text-warning" :
              "text-danger"
            }>{product.status}</strong>
          </Card.Text>
          <div className="d-flex gap-2 mt-auto">
            <Button 
              variant="primary" 
              className="flex-grow-1"
              onClick={() => handleEditProduct(product)}
            >
              Edit Product
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={() => openUpdateModal(product)}
              disabled={product.status === "rejected"}
            >
              Quick Update
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>

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
    <div className="content-wrapper">
      <Title title={'List Products'}/>
      <div className="content-card">
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
            <Modal.Title>Update Stock - {selectedProduct?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Product Details</Form.Label>
                <div className="border rounded p-3 bg-light">
                  <p className="mb-2"><strong>Category:</strong> {selectedProduct?.category?.name}</p>
                  <p className="mb-2"><strong>Price:</strong> ${selectedProduct?.price}</p>
                  <p className="mb-2"><strong>Description:</strong> {selectedProduct?.description}</p>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Current Stock</Form.Label>
                <div className="d-flex align-items-center">
                  <div className={`badge ${selectedProduct?.quantity > 0 ? 'bg-success' : 'bg-danger'} me-2`}>
                    {selectedProduct?.quantity || 0} units
                  </div>
                  <span className="text-muted">
                    ({selectedProduct?.quantity > 0 ? 'In Stock' : 'Out of Stock'})
                  </span>
                </div>
              </Form.Group>
              <Form.Group>
                <Form.Label>New Stock Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  placeholder="Enter new quantity"
                  isInvalid={newQuantity === "" || parseInt(newQuantity) < 0}
                />
                <Form.Text className="text-muted">
                  Enter 0 or more units. The product status will automatically update based on the quantity.
                </Form.Text>
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
              disabled={loading || newQuantity === "" || parseInt(newQuantity) < 0}
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
            <button className="btn btn-link" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .content-wrapper {
          padding: 20px;
          background: #f8f9fa;
        }

        .content-card {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .content-wrapper {
            padding: 15px;
          }

          .content-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductPanel;
