import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { InfoCircle, Flower2, CashStack } from 'react-bootstrap-icons';

function About() {
  return (
    <section className="about-section">
      <Container>
        <Row className="text-center">
          <Col className="text-light mb-3">
            <h2 className="my-4 text-light">About Us</h2>
            <p>
              We are dedicated to connecting buyers with local florists and growers, offering a wide range of
              beautiful flowers and plants. Our goal is to provide a seamless shopping experience for flower
              enthusiasts while supporting local businesses.
            </p>
          </Col>
        </Row>
        <Row className="text-center">
          <Col sm={12} md={4} className="mb-4">
            <Card className="shadow-lg">
              <Card.Body>
                <InfoCircle size={50} className="text-success mb-3" />
                <Card.Title>Who We Are</Card.Title>
                <Card.Text>
                  A marketplace that bridges the gap between flower buyers and local florists, offering fresh
                  and beautiful flowers for all occasions.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={12} md={4} className="mb-4">
            <Card className="shadow-lg">
              <Card.Body>
                <Flower2 size={50} className="text-success mb-3" />
                <Card.Title>Our Flowers</Card.Title>
                <Card.Text>
                  We offer a wide selection of flowers, from classic bouquets to exotic plants. Every order is
                  curated to perfection.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={12} md={4} className="mb-4">
            <Card className="shadow-lg">
              <Card.Body>
                <CashStack size={50} className="text-success mb-3" />
                <Card.Title>Our Commission</Card.Title>
                <Card.Text>
                  We charge a 10% commission on each order, ensuring that florists and buyers both get the best
                  value in every transaction.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default About;
