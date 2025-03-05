import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Envelope, Phone, GeoAlt } from 'react-bootstrap-icons';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <section className="contact-section">
      <Container>
        <Row className="text-center mb-5">
          <Col>
            <h2 className="display-4 text-light mb-4">Contact Us</h2>
            <p className="lead text-light mb-0">
              Feel free to reach out if you have any questions or need assistance.
            </p>
          </Col>
        </Row>
        <Row className="g-4">
          <Col sm={12} md={6}>
            <div className="contact-info-card">
              <h4 className="text-success mb-4">Get In Touch</h4>
              <div className="contact-item mb-4">
                <GeoAlt size={24} className="text-success me-3" />
                <div>
                  <strong className="d-block">Our Address</strong>
                  <span className="text-muted">123 Flower Lane, City, Country</span>
                </div>
              </div>
              <div className="contact-item mb-4">
                <Phone size={24} className="text-success me-3" />
                <div>
                  <strong className="d-block">Phone</strong>
                  <span className="text-muted">(123) 456-7890</span>
                </div>
              </div>
              <div className="contact-item">
                <Envelope size={24} className="text-success me-3" />
                <div>
                  <strong className="d-block">Email</strong>
                  <span className="text-muted">floralink.2025@gmail.com</span>
                </div>
              </div>
            </div>
          </Col>
          <Col sm={12} md={6}>
            <div className="contact-form-card">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="formName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formMessage">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="message"
                    rows={5}
                    placeholder="Your message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-control-lg"
                  />
                </Form.Group>

                <Button 
                  variant="success" 
                  type="submit" 
                  size="lg"
                  className="w-100 rounded-pill"
                >
                  Send Message
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx="true">{`
        .contact-section {
          padding: 4rem 0;
          position: relative;
          overflow: hidden;
        }

        .contact-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="80">🌸</text></svg>') center/50px repeat;
          opacity: 0.1;
          animation: floatingFlowers 60s linear infinite;
        }

        @keyframes floatingFlowers {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-50%) rotate(360deg);
          }
        }

        .contact-info-card,
        .contact-form-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
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

        .lead {
          font-size: 1.25rem;
          font-weight: 300;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }

        .display-4 {
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .text-success {
          color: #15803d !important;
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
    </section>
  );
}

export default Contact;
