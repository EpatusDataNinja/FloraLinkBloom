import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import { Form, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import Title from "../../components_part/TitleCard";
import axios from 'axios';

const ProductForm = ({ editMode, productData }) => {
  const [product, setProduct] = useState({
    name: "",
    categoryID: "",
    description: "",
    price: "",
    quantity: "",
    image: null,
    currentImage: null,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (editMode && productData) {
      setProduct({
        name: productData.name || "",
        categoryID: productData.category?.id || productData.categoryID || "",
        description: productData.description || "",
        price: String(productData.price || ""), // Convert to string
        quantity: String(productData.quantity || ""), // Convert to string
        image: null,
        currentImage: productData.image || null,
      });
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
    const file = e.target.files[0];
    if (file) {
      console.log('New image selected:', file.name);
      setProduct(prev => ({
        ...prev,
        image: file,
        currentImage: null // Clear current image when new file is selected
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const formData = new FormData();
    
    try {
      // Basic fields
      formData.append("name", product.name.trim());
      formData.append("categoryID", String(product.categoryID));
      formData.append("description", product.description.trim());
      formData.append("price", String(product.price));
      formData.append("quantity", String(product.quantity));
      
      // Set initial status for new products
      if (!editMode) {
        formData.append("status", "Pending Approval");
      }

      // Handle image
      if (product.image instanceof File) {
        formData.append("image", product.image);
        console.log('Appending new image file:', product.image.name);
      } else if (editMode && product.currentImage) {
        formData.append("existingImage", product.currentImage);
        console.log('Using existing image:', product.currentImage);
      }

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const endpoint = editMode 
        ? `${process.env.REACT_APP_BASE_URL}/api/v1/product/update/${productData.id}`
        : `${process.env.REACT_APP_BASE_URL}/api/v1/product/add`;

      // Debug logging
      console.log('Submitting form to:', endpoint);
      console.log('Form data contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File (${value.name})` : value}`);
      }

      const response = await fetch(endpoint, {
        method: editMode ? "PUT" : "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to process request");
      }

      // If this is a new product, notify admins
      if (!editMode) {
        try {
          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/api/v1/notification/create`,
            {
              title: 'New Product Approval Required',
              message: `A new product "${product.name}" requires approval.`,
              type: 'NEW_PRODUCT',
              relatedId: data.data.id
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
          // Don't throw here - we don't want to prevent product creation
        }
      }

      toast.success(editMode ? "Product updated successfully!" : "Product added successfully!");
      
      setTimeout(() => {
        navigate("/dashboard/seller/products");
      }, 2000);

    } catch (error) {
      console.error("Error details:", error);
      toast.error(error.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/v1/product/delete/${productData.id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete product");
      }

      toast.success("Product deleted successfully!");
      
      // Use the stored return URL or fall back to a default
      const returnUrl = location.state?.returnUrl || "/dashboard/seller/products";
      
      setTimeout(() => {
        navigate(returnUrl);
      }, 2000);

    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Error deleting product");
    }
  };

  const validateForm = () => {
    try {
      if (!product.name?.trim()) throw new Error("Product name is required");
      if (!product.categoryID) throw new Error("Category is required");
      if (!product.description?.trim()) throw new Error("Description is required");
      
      const price = parseFloat(product.price);
      if (isNaN(price) || price <= 0) throw new Error("Price must be a valid number greater than 0");
      
      const quantity = parseInt(product.quantity);
      if (isNaN(quantity) || quantity < 0) throw new Error("Quantity must be a valid non-negative number");
      
      // Image validation only for new products or when updating with new image
      if (!editMode && !product.image) {
        throw new Error("Product image is required for new products");
      }

      if (product.image instanceof File) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(product.image.type)) {
          throw new Error("Please upload a valid image file (JPEG, PNG, GIF, or WEBP)");
        }
        
        if (product.image.size > 5 * 1024 * 1024) {
          throw new Error("Image file size must be less than 5MB");
        }
      }
      
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  return (
    <div className="content-wrapper">
      <Title title={editMode ? "Edit Product" : "Add New Product"} />
      <div className="content-card">
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
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

          <div className="d-flex justify-content-between">
            <Button
              variant="primary"
              type="submit"
              className="w-50 me-2"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                editMode ? "Update Product" : "Add Product"
              )}
            </Button>

            {editMode && (
              <Button
                variant="danger"
                type="button"
                className="w-50 ms-2"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Delete Product"
                )}
              </Button>
            )}
          </div>
        </Form>
      </div>

      <ToastContainer />

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

export default ProductForm;
