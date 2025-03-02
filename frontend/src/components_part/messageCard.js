import React from "react";
import { Card } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa"; // No data icon

const MessageCard = ({ message }) => {
  return (
    <Card className="mb-4 shadow-lg text-center p-3">
      <Card.Body>
        <FaInfoCircle size={50} className="text-muted" />
        <Card.Text className="mt-3">{message || "No Message Available"}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default MessageCard;
