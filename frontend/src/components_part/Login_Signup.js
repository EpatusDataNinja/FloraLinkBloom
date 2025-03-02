import React, { useState } from "react";
import { Button, Form, Tab, Tabs, Container, Card, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [activeKey, setActiveKey] = useState("login");
    const navigate = useNavigate();

    // Login state variables
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Signup state variables
    const [signupFirstname, setSignupFirstname] = useState("");
    const [signupLastname, setSignupLastname] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPhone, setSignupPhone] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
    const [signupGender, setSignupGender] = useState("Male");
    const [signupAddress, setSignupAddress] = useState("");
    const [signupRole, setSignupRole] = useState("buyer");

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

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        if (signupPassword !== signupConfirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "*/*",
            },
            body: JSON.stringify({
                firstname: signupFirstname,
                lastname: signupLastname,
                email: signupEmail,
                phone: signupPhone,
                password: signupPassword,
                confirmPassword: signupConfirmPassword,
                gender: signupGender,
                address: signupAddress,
                role: signupRole,
            }),
        });

        const result = await response.json();
        if (result.success) {
            toast.success("Signup successful");
            // Optionally redirect to login or handle further behavior
        } else {
            toast.error("Signup failed: " + result.message);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <h4 className="text-center mb-4">Welcome to Our Platform</h4>
                            <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k)} id="auth-tabs">
                                {/* Login Tab */}
                                <Tab eventKey="login" title="Login">
                                    <Form onSubmit={handleLoginSubmit}>
                                        <Form.Group className="mb-3" controlId="loginEmail">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="Enter email"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="loginPassword">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Password"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                required
                                            />
                                        </Form.Group>

                                        <Button variant="primary" type="submit" className="w-100">
                                            Login
                                        </Button>
                                    </Form>
                                </Tab>

                                {/* Signup as Buyer Tab */}
                                <Tab eventKey="signupBuyer" title="Sign Up as Buyer">
                                    <Form onSubmit={handleSignupSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupFirstname">
                                                    <Form.Label>First Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="First Name"
                                                        value={signupFirstname}
                                                        onChange={(e) => setSignupFirstname(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupLastname">
                                                    <Form.Label>Last Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Last Name"
                                                        value={signupLastname}
                                                        onChange={(e) => setSignupLastname(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupEmail">
                                                    <Form.Label>Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Email"
                                                        value={signupEmail}
                                                        onChange={(e) => setSignupEmail(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupPhone">
                                                    <Form.Label>Phone</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Phone"
                                                        value={signupPhone}
                                                        onChange={(e) => setSignupPhone(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupPassword">
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="Password"
                                                        value={signupPassword}
                                                        onChange={(e) => setSignupPassword(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupConfirmPassword">
                                                    <Form.Label>Confirm Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="Confirm Password"
                                                        value={signupConfirmPassword}
                                                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3" controlId="signupGender">
                                            <Form.Label>Gender</Form.Label>
                                            <Form.Select
                                                value={signupGender}
                                                onChange={(e) => setSignupGender(e.target.value)}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="signupAddress">
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Address"
                                                value={signupAddress}
                                                onChange={(e) => setSignupAddress(e.target.value)}
                                                required
                                            />
                                        </Form.Group>

                                        <Button
                                            variant="success"
                                            type="submit"
                                            className="w-100"
                                            onClick={() => setSignupRole("buyer")}
                                        >
                                            Sign Up as Buyer
                                        </Button>
                                    </Form>
                                </Tab>

                                {/* Signup as Seller Tab */}
                                <Tab eventKey="signupSeller" title="Sign Up as Seller">
                                    <Form onSubmit={handleSignupSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupFirstname">
                                                    <Form.Label>First Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="First Name"
                                                        value={signupFirstname}
                                                        onChange={(e) => setSignupFirstname(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupLastname">
                                                    <Form.Label>Last Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Last Name"
                                                        value={signupLastname}
                                                        onChange={(e) => setSignupLastname(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupEmail">
                                                    <Form.Label>Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Email"
                                                        value={signupEmail}
                                                        onChange={(e) => setSignupEmail(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupPhone">
                                                    <Form.Label>Phone</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Phone"
                                                        value={signupPhone}
                                                        onChange={(e) => setSignupPhone(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        
                                        <Form.Group className="mb-3" controlId="signupGender">
                                            <Form.Label>Gender</Form.Label>
                                            <Form.Select
                                                value={signupGender}
                                                onChange={(e) => setSignupGender(e.target.value)}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="signupAddress">
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Address"
                                                value={signupAddress}
                                                onChange={(e) => setSignupAddress(e.target.value)}
                                                required
                                            />
                                        </Form.Group>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupPassword">
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="Password"
                                                        value={signupPassword}
                                                        onChange={(e) => setSignupPassword(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="signupConfirmPassword">
                                                    <Form.Label>Confirm Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="Confirm Password"
                                                        value={signupConfirmPassword}
                                                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Button
                                            variant="success"
                                            type="submit"
                                            className="w-100"
                                            onClick={() => setSignupRole("seller")}
                                        >
                                            Sign Up as Seller
                                        </Button>
                                    </Form>
                                   
                                </Tab>
                            </Tabs>  
                            <div className="form-group mt-3">
                  <Link to='../forgot'> <b style={{ textAlign: 'center', color: 'green' }}>forgot password</b></Link>
                  {/* <input type="password" oninput="maskPassword()" className="form-control" name="password" id="subject" placeholder="************" onChange={handleChange} /> */}
                </div>
                        </Card.Body>
                     
                    </Card>
                </Col>
            </Row>

            {/* Toast Notifications */}
            <ToastContainer />
        </Container>
    );
};

export default AuthPage;
