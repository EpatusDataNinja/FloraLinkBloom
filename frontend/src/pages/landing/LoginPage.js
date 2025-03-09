import React from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserHeader from "../../components_part/user_header";

const LoginPage = () => {
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    });

    const result = await response.json();
    if (result.success) {
      // Transfer guest cart items to authenticated cart
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      if (guestCart.length > 0) {
        // Check if authenticated cart already has items from a different seller
        if (existingCart.length > 0 && guestCart[0].sellerId !== existingCart[0].sellerId) {
          toast.warning("Your guest cart items are from a different seller. They will be saved for later.");
        } else {
          // Merge guest cart items with existing cart
          const mergedCart = [...existingCart];
          
          guestCart.forEach(guestItem => {
            const existingItem = mergedCart.find(item => item.id === guestItem.id);
            if (!existingItem) {
              mergedCart.push(guestItem);
            }
          });
          
          localStorage.setItem("cart", JSON.stringify(mergedCart));
          localStorage.removeItem("guestCart");
          
          if (guestCart.length > 0) {
            toast.success("Guest cart items have been added to your cart!");
          }
        }
      }

      toast.success("Login successful");
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      const role = result.user.role;
      setTimeout(() => {
        if (role === 'admin') {
          navigate('../admin/overview');
        } else if (role === 'buyer') {
          navigate('../buyer/overview');
        }
        else if (role === 'seller') {
          navigate('../seller/overview');
        }
      }, 2000);
    } else {
      toast.error("Login failed: " + result.message);
    }
  };

  return (
    <div className="page-container">
      <UserHeader />
      <Container className="main-content">
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="login-card">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4 text-success">Welcome Back</h2>
                <Form onSubmit={handleLoginSubmit}>
                  <Form.Group className="mb-4" controlId="loginEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="form-control-lg"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="loginPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="form-control-lg"
                      required
                    />
                  </Form.Group>

                  <Button 
                    variant="success" 
                    type="submit" 
                    size="lg"
                    className="w-100 mb-3 rounded-pill"
                  >
                    Login
                  </Button>

                  <div className="text-center mt-4">
                    <Link to="/forgot" className="text-success text-decoration-none">
                      <strong>Forgot Password?</strong>
                    </Link>
                  </div>

                  <div className="text-center mt-3">
                    <p className="mb-0">Don't have an account?</p>
                    <div className="d-flex justify-content-center gap-2 mt-2">
                      <Link to="/register?role=buyer" className="text-success text-decoration-none">
                        <strong>Sign up as Buyer</strong>
                      </Link>
                      <span className="text-muted">|</span>
                      <Link to="/register?role=seller" className="text-success text-decoration-none">
                        <strong>Sign up as Seller</strong>
                      </Link>
                    </div>
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
          margin-top: -2rem;
        }
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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

export default LoginPage; 