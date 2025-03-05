
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const Services = ({ services }) => {
  return (
    <div className="services-section">
      <h2 className="text-center mb-4" style={{ color: '#166534', fontWeight: 'bold', fontSize: '2.5rem' }}>
        Our Services
      </h2>
      <Row className="g-4">
        {services.map((service) => (
          <Col key={service.id} xs={12} md={6} xl={3} className="mb-4">
            <Card className="h-100 service-card border-0 shadow-sm hover-effect">
              <Card.Body className="text-center">
                <div className="service-icon mb-3">
                  <span style={{ fontSize: '2.5rem' }}>{service.icon}</span>
                </div>
                <Card.Title style={{ color: '#166534', fontWeight: 'bold' }}>
                  {service.name}
                </Card.Title>
                <Card.Text className="text-muted">
                  {service.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <style jsx="true">{`
        .service-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
          background: white;
          border-radius: 10px;
        }
        
        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .service-icon {
          background: linear-gradient(135deg, #166534, #22c55e);
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: white;
        }

        .g-4 {
          --bs-gutter-x: 1.5rem;
          --bs-gutter-y: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default Services; 