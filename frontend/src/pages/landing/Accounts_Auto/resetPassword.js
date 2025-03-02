
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../../../components_part/loading';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Form, Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { Lock, Key } from 'react-bootstrap-icons';

function App() {
  const navigate = useNavigate();
  const { email } = useParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/resetPassword/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (response.ok) {
        const res = await response.json();
        toast.success(res.message);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        await navigate('../auto');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message);
      }
    } catch (error) {
      console.error('Error creating account', error);
      toast.error('Failed to create account. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <section className="reset-password-form">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={6}>
              <div className="form-wrapper">
                <h4 className="text-center text-light">Reset Your Password</h4>

                <Form onSubmit={handleSubmit} className="mt-4">
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="newPassword" className="text-light">New Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Lock />
                      </InputGroup.Text>
                      <FormControl
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        placeholder="************"
                        onChange={handleChange}
                        style={{
                          border: '1px solid #4CAF50',
                        }}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="confirmPassword" className="text-light">Confirm Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Key />
                      </InputGroup.Text>
                      <FormControl
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        placeholder="************"
                        onChange={handleChange}
                        style={{
                          border: '1px solid #4CAF50',
                        }}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Link to="../forgot">
                      <b className="text-light">Go back to get a reset code</b>
                    </Link>
                  </Form.Group>

                  <div className="text-center mt-4">
                    <Button
                      type="submit"
                      variant="success"
                      className="btn-lg form-control"
                      disabled={loading}
                      style={{
                        backgroundColor: 'white',
                        color: 'green',
                        borderRadius: '3px',
                        fontWeight: 'bold',
                      }}
                    >
                      {loading ? <LoadingSpinner /> : 'Reset Password'}
                    </Button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <ToastContainer />
    </>
  );
}

export default App;
