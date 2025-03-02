import React, { useState } from 'react';
import { Button, Form, Container, Col, Row, InputGroup } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { Envelope } from 'react-bootstrap-icons';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../../../components_part/loading'; // Assuming you have this component
import { useNavigate } from 'react-router-dom';
function App() {
  const [formData, setFormData] = useState({ email: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData }),
      });

      if (response.ok) {
        const res = await response.json();
        toast.success(res.message);
        await new Promise((resolve) => setTimeout(resolve, 2000));


        await navigate(`../code_verification/${formData.email}`);


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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={6} className="mx-auto">
          <div className="text-center mb-4">
            <h3 className="text-light">Send Verification Code</h3>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label className="text-light">Email Address</Form.Label>
              <InputGroup>
                <InputGroup.Text><Envelope /></InputGroup.Text>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </Form.Group>

            <div className="text-center">
              <Button
                type="submit"
                className="w-100"
                style={{ backgroundColor: 'green', borderColor: 'green' }}
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : 'Get Code'}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      <ToastContainer />
    </Container>
  );
}

export default App;
