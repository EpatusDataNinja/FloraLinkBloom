import React from "react";
import { Card } from "react-bootstrap";

const TitleCard = ({ title }) => {
  return (
    <Card className="mb-4">
      <Card.Body>
        <h2 className="mb-0">{title}</h2>
      </Card.Body>
    </Card>
  );
};

export default TitleCard;
