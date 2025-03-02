import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import { Form, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import Title from "../../components_part/TitleCard";

const AddProductForm = () => {
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

  // Fetch categories on component mount
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
          setCategories(data.data); // Populate categories
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
    if (!product.name || !product.categoryID || !product.description || !product.price || !product.quantity || !product.image) {
      toast.error("All fields are required!");
      return false;
    }
    if (product.price <= 0 || product.quantity <= 0) {
      toast.error("Price and quantity must be greater than 0");
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

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/product/add`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Product added successfully!");
        // navigate("/dashboard"); // Redirect to the dashboard or another page
      } else {
        toast.error("Failed to add product");
      }
    } catch (error) {
      toast.error("Error adding product");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <Card className="p-4">
        <Card.Header className="text-center">
        
          <Title title={'Add New Product'}/>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Product Name */}
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

              {/* Category */}
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

            {/* Product Description */}
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

            {/* Price */}
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

              {/* Quantity */}
              <Col md={6} className="mb-3">
                <Form.Group controlId="quantity">
                  <Form.Label>Quantity</Form.Label>
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

            {/* Image */}
            <Form.Group controlId="image" className="mb-3">
              <Form.Label>Product Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </Form.Group>

            {/* Submit Button */}
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Add Product"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default AddProductForm;
