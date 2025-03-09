import React from 'react';
import { Card, Col } from 'react-bootstrap';

const QuickLinkCard = ({ link, onClick }) => (
  <Col xs={12} sm={6} lg={3}>
    <Card className="quick-link-card" onClick={onClick}>
      <Card.Body>
        <div className="icon-wrapper" style={{ backgroundColor: `${link.color}20`, color: link.color }}>
          {link.icon}
        </div>
        <h3>{link.title}</h3>
        <p>{link.description}</p>
      </Card.Body>
    </Card>

    <style jsx="true">{`
      .quick-link-card {
        border: none;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .quick-link-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      }

      .icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }
    `}</style>
  </Col>
);

export default QuickLinkCard;
