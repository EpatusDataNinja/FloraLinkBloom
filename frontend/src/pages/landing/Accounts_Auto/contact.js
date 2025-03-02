import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, FormControl } from 'react-bootstrap';
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
    console.log(formData); // Placeholder for submitting the form
  };

  return (
    <section className="contact-section text-light">
      <Container>
        <Row className="text-center">
          <Col>
            <h2 className="my-4 text-light">Contact Us</h2>
            <p>Feel free to reach out if you have any questions or need assistance.</p>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <div className="contact-info">
              <h4>Get In Touch</h4>
              <div className="mb-4">
                <GeoAlt size={30} className="text-light" /> <strong>Our Address:</strong> 123 Flower Lane, City, Country
              </div>
              <div className="mb-4">
                <Phone size={30} className="text-light" /> <strong>Phone:</strong> (123) 456-7890
              </div>
              <div className="mb-4">
                <Envelope size={30} className="text-light" /> <strong>Email:</strong> support@flowerlink.com
              </div>
            </div>
          </Col>
          <Col sm={12} md={6}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formMessage">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  name="message"
                  rows={4}
                  placeholder="Your message"
                  value={formData.message}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button variant="success" type="submit" className="w-100">
                Send Message
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default Contact;
