import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { MdVpnKey } from 'react-icons/md'; // Importing the key icon from react-icons
import { FaCheckCircle } from 'react-icons/fa'; // Importing the check-circle icon for success feedback
import LoadingSpinner from '../../../components_part/loading'; // Import the LoadingSpinner component

function App() {
  const navigate = useNavigate();
  const { email } = useParams();
  const [formData, setFormData] = useState({
    code: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/users/code/${email}`, {
        method: 'POST',
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

        await navigate(`../resetPassword/${email}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message);
      }
    } catch (error) {
      console.error('Error processing code', error);
      toast.error('Failed to process code. Please try again later.');
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
      <section id="herofm" className="herofm" style={{ marginTop: '3cm' }}>
        <Container>
          <Row className="gy-5" data-aos="fade-in">
            {/* Left Side - Form */}
            <Col lg={6} className="d-flex flex-column justify-content-center text-center text-lg-start loginForm">
              <Form onSubmit={handleSubmit} className="p-4 rounded-lg shadow-lg" style={{ backgroundColor: '#fff' }}>
                <h4 className="mb-4" style={{ fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
                  Enter Verification Code
                </h4>

                <Form.Group className="mb-3" controlId="code">
                  <Form.Label className="text-muted">
                    <MdVpnKey size={20} className="me-2" />
                    Code
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    placeholder="Ex: 00000"
                    onChange={handleChange}
                    style={{
                      borderColor: 'lightgray',
                      fontSize: '1rem',
                      padding: '10px',
                      outline: 'none',
                    }}
                  />
                </Form.Group>

                <div className="text-center mt-3">
                  <Button
                    type="submit"
                    className={`w-100 ${loading ? 'btn-secondary' : 'btn-primary'}`}
                    disabled={loading}
                    style={{
                      fontSize: '1.2rem',
                      padding: '12px',
                      borderRadius: '10px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? <LoadingSpinner /> : <FaCheckCircle size={20} className="me-2" />}
                    {loading ? 'Processing...' : 'Check Code'}
                  </Button>
                </div>
              </Form>
            </Col>

            {/* Right Side - Icon Section */}
            <Col lg={6} className="d-flex align-items-center justify-content-center">
              <div className="icon-container" style={{ textAlign: 'center' }}>
                <MdVpnKey size={120} color="white" />
                <p className="mt-3 text-light"  style={{ fontSize: '1.5rem' }}>Enter the code sent to your email to proceed with the password reset.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Toast Notifications */}
      <ToastContainer />
    </>
  );
}

export default App;
