import React from "react";
import { Card } from "react-bootstrap";

const TitleCard = ({ title, className }) => {
  return (
    <Card className={`shadow-sm text-center p-2 ${className || ''}`} style={{
      backgroundColor: 'white',
      marginTop: '-40px',
      marginLeft: '15px',
      width: 'fit-content'
    }}>
      <Card.Body className="py-1">
        <Card.Title className="fs-5 fw-bold mb-0 text-success">{title || "Untitled Page"}</Card.Title>
      </Card.Body>
    </Card>
  );
};

export default TitleCard;
