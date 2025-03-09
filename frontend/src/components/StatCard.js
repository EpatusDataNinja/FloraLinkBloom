import React from 'react';
import { Card } from 'react-bootstrap';

const StatCard = ({ icon, title, value, color, bgColor }) => (
  <Card className="stat-card">
    <Card.Body>
      <div className="d-flex align-items-center">
        <div className="stat-icon" style={{ backgroundColor: bgColor, color: color }}>
          {icon}
        </div>
        <div className="ms-3">
          <h6 className="stat-title">{title}</h6>
          <h3 className="stat-value" style={{ color }}>{value}</h3>
        </div>
      </div>
    </Card.Body>

    <style jsx="true">{`
      .stat-card {
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        border-radius: 12px;
      }

      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }

      .stat-title {
        color: #6b7280;
        margin-bottom: 0.25rem;
        font-size: 0.875rem;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0;
      }
    `}</style>
  </Card>
);

export default StatCard;
