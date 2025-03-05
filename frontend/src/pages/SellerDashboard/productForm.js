import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import { Form, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import Title from "../../components_part/TitleCard";

const AddProductForm = ({ editMode, productData }) => {
  const [product, setProduct] = useState({
    name: "",
    categoryID: "",
    description: "",
    price: "",
    quantity: "",
    image: null,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (editMode && productData) {
      setProduct(prev => ({
        ...prev,
        ...productData,
        image: null // Don't set the image in edit mode unless changed
      }));
    }
  }, [editMode, productData]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/categories/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "*/*",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data.data);
        } else {
          toast.error("Failed to fetch categories");
        }
      } catch (error) {
        toast.error("Error fetching categories");
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setProduct((prevState) => ({
      ...prevState,
      image: e.target.files[0],
    }));
  };

  const validateForm = () => {
    if (!product.name || !product.categoryID || !product.description || !product.price || !product.quantity) {
      toast.error("All fields are required!");
      return false;
    }
    if (product.price <= 0 || product.quantity < 0) {
      toast.error("Price must be greater than 0 and quantity must be 0 or greater");
      return false;
    }
    if (!editMode && !product.image) {
      toast.error("Product image is required!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("categoryID", product.categoryID);
    formData.append("description", product.description);
    formData.append("price", product.price);
    formData.append("quantity", product.quantity);
    if (product.image) formData.append("image", product.image);

    const endpoint = editMode 
      ? `${process.env.REACT_APP_BASE_URL}/api/v1/product/update/${productData.id}`
      : `${process.env.REACT_APP_BASE_URL}/api/v1/product/add`;

    try {
      const response = await fetch(endpoint, {
        method: editMode ? "PUT" : "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(editMode ? "Product updated successfully!" : "Product added successfully!");
        
        // Notify other components about the stock update
        const event = new CustomEvent('productStockUpdate', {
          detail: {
            productId: editMode ? productData.id : data.data.id,
            newQuantity: parseInt(product.quantity),
            action: editMode ? 'update' : 'add'
          }
        });
        window.dispatchEvent(event);

        // Navigate after a short delay to allow the toast to be seen
        setTimeout(() => {
          navigate("/seller/products");
        }, 2000);
      } else {
        toast.error(editMode ? "Failed to update product" : "Failed to add product");
      }
    } catch (error) {
      toast.error(editMode ? "Error updating product" : "Error adding product");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <Card className="p-4">
        <Card.Header className="text-center">
          <Title title={editMode ? 'Update Product' : 'Add New Product'}/>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group controlId="name">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter product name"
                    name="name"
                    value={product.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group controlId="categoryID">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    as="select"
                    name="categoryID"
                    value={product.categoryID}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="description" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter product description"
                name="description"
                value={product.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Group controlId="price">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter price"
                    name="price"
                    value={product.price}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group controlId="quantity">
                  <Form.Label>Quantity in Stock</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter quantity"
                    name="quantity"
                    value={product.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="image" className="mb-3">
              <Form.Label>{editMode ? 'Update Product Image (optional)' : 'Product Image'}</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                required={!editMode}
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                editMode ? "Update Product" : "Add Product"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <ToastContainer />
    </div>
  );
};

export default AddProductForm;
