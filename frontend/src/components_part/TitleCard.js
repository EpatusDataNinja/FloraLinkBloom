import React from "react";
import { Card } from "react-bootstrap";

const TitleCard = ({ title }) => {
  return (
    <Card className="mb-4 shadow-sm text-center p-3  text-success" style={{backgroundColor:'white'}}>
      <Card.Body>
        <Card.Title className="fs-3 fw-bold">{title || "Untitled Page"}</Card.Title>
      </Card.Body>
    </Card>
  );
};

export default TitleCard;
