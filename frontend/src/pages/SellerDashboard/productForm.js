import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import Title from "../../components_part/TitleCard";
import axios from 'axios';

const ProductForm = ({ editMode, productData }) => {
  // Add debug logging for props
  console.log('ProductForm mounted with:', { editMode, productData });

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

  // Separate useEffect for initial data population
  useEffect(() => {
    let mounted = true;

    if (editMode && productData && mounted) {
      console.log('Setting initial product data:', productData);
      
      setProduct({
        name: productData.name || "",
        categoryID: productData.category?.id || productData.categoryID || "",
        description: productData.description || "",
        price: String(productData.price || ""),
        quantity: String(productData.quantity || ""),
        image: null,
        currentImage: productData.image || null,
      });
    }

    return () => {
      mounted = false;
    };
  }, [editMode, productData]); // Remove product from dependencies

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/categories/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "*/*",
          },
        });

        if (!mounted) return;

        if (response.ok) {
          const data = await response.json();
          setCategories(data.data);
        } else {
          toast.error("Failed to fetch categories");
        }
      } catch (error) {
        if (mounted) {
          toast.error("Error fetching categories");
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
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
        // Get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo.id) {
            throw new Error("User information not found");
        }

        // Basic fields with type conversion
        formData.append("name", product.name.trim());
        formData.append("categoryID", Number(product.categoryID));
        formData.append("description", product.description.trim());
        formData.append("price", Number(product.price));
        formData.append("quantity", Number(product.quantity));
        formData.append("status", "Pending Approval");
        formData.append("userID", userInfo.id);

        // Image handling with validation
        if (product.image instanceof File) {
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (product.image.size > maxSize) {
                throw new Error("Image size must be less than 5MB");
            }
            formData.append("image", product.image);
        }

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        // Use axios with proper configuration
        const response = await axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASE_URL}/api/v1/product/add`,
            data: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        });

        console.log('Server response:', response.data);

        if (response.data.success) {
            toast.success("Product added successfully!");
            // Show warning if email notifications failed
            if (response.data.emailError) {
                toast.warning("Product added but email notifications may be delayed");
            }
            setTimeout(() => {
                navigate("/dashboard/seller/products");
            }, 2000);
        } else {
            throw new Error(response.data.message || "Failed to add product");
        }

    } catch (error) {
        console.error("Error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // More specific error handling
        if (error.response?.data?.error?.includes('Invalid login')) {
            // Email service error - product still added
            toast.success("Product added successfully!");
            toast.warning("Email notifications may be delayed");
            setTimeout(() => {
                navigate("/dashboard/seller/products");
            }, 2000);
        } else {
            toast.error(error.response?.data?.message || "Failed to add product");
        }
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Add debug logging
      console.log('Deleting product:', productData.id);

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/v1/product/delete/${productData.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      // Send notification about product deletion
      try {
        await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/v1/notification/create`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              title: `Product Deleted by Seller`,
              message: `Product "${productData.name}" has been deleted.`,
              type: "PRODUCT_DELETED",
              relatedId: productData.id
            })
          }
        );
      } catch (notifError) {
        console.warn('Notification creation failed, but product was deleted successfully:', notifError);
      }

      toast.success("Product deleted successfully!");
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate("/dashboard/seller/products");
      }, 2000);

    } catch (error) {
      console.error("Delete error details:", error);
      toast.error(error.message || "Failed to delete product");
    } finally {
      setLoading(false);
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
    <>
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
        .content-card {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .content-card {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default ProductForm;
