import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserHeader from "../../components_part/user_header";
import axios from 'axios';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('buyer');
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'Male',
    address: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam) {
      setRole(roleParam);
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstname) newErrors.firstname = 'First name is required';
    if (!formData.lastname) newErrors.lastname = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.address) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill out all fields correctly.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/v1/users/signup`,
        {
          ...formData,
          role: role
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success("Signup successful! Please wait for admin approval.");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          "Failed to create account. Please try again.";
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="page-container">
      <UserHeader />
      <Container className="main-content">
        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            <Card className="signup-card">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4 text-success">
                  Sign Up as {role === 'seller' ? 'Grower/Florist' : 'Buyer'}
                </h2>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstname"
                          placeholder="Enter first name"
                          value={formData.firstname}
                          onChange={handleChange}
                          className="form-control-lg"
                          required
                          autoComplete="given-name"
                          isInvalid={!!errors.firstname}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.firstname}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastname"
                          placeholder="Enter last name"
                          value={formData.lastname}
                          onChange={handleChange}
                          className="form-control-lg"
                          required
                          autoComplete="family-name"
                          isInvalid={!!errors.lastname}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.lastname}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="Enter email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control-lg"
                          required
                          autoComplete="email"
                          isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-control-lg"
                          required
                          autoComplete="tel"
                          isInvalid={!!errors.phone}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.phone}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-control-lg"
                          required
                          autoComplete="new-password"
                          isInvalid={!!errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="form-control-lg"
                          required
                          autoComplete="new-password"
                          isInvalid={!!errors.confirmPassword}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="form-control-lg"
                          autoComplete="sex"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          placeholder="Enter address"
                          value={formData.address}
                          onChange={handleChange}
                          className="form-control-lg"
                          required
                          autoComplete="street-address"
                          isInvalid={!!errors.address}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.address}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button 
                    variant="success" 
                    type="submit" 
                    size="lg"
                    className="w-100 mb-3 rounded-pill"
                  >
                    Sign Up
                  </Button>

                  <div className="text-center mt-3">
                    <p className="mb-0">Already have an account?</p>
                    <Link to="/login" className="text-success text-decoration-none">
                      <strong>Login here</strong>
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx="true">{`
        .page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #15803d, #84cc16);
        }
        .main-content {
          padding: 2rem 1rem;
        }
        .signup-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin-top: 2rem;
          margin-bottom: 2rem;
        }
        .form-control-lg {
          border: 2px solid rgba(21, 128, 61, 0.1);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.3s ease;
        }
        .form-control-lg:focus {
          border-color: #15803d;
          box-shadow: 0 0 0 0.25rem rgba(21, 128, 61, 0.25);
        }
        .btn-success {
          background-color: #15803d;
          border-color: #15803d;
          padding: 0.75rem 2rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .btn-success:hover {
          background-color: #166534;
          border-color: #166534;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(21, 128, 61, 0.3);
        }
      `}</style>

      <ToastContainer />
    </div>
  );
};

export default SignupPage;