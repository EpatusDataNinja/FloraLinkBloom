import React from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { FaPrint, FaFilePdf } from 'react-icons/fa';

export const ReportActions = ({ onPrint, onGeneratePDF, loading, disabled }) => (
  <div className="d-flex gap-2">
    <Button 
      variant="primary" 
      onClick={onPrint}
      disabled={loading || disabled}
      className="d-flex align-items-center gap-2"
    >
      <FaPrint /> Print Report
    </Button>
    <Button 
      variant="secondary" 
      onClick={onGeneratePDF}
      disabled={loading || disabled}
      className="d-flex align-items-center gap-2"
    >
      <FaFilePdf /> Save as PDF
    </Button>
  </div>
);

export const ReportSummaryCard = ({ title, value, subtitle, icon }) => (
  <Card className="summary-card">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="text-muted">{title}</h6>
          <h4 className="mb-0">{value}</h4>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        {icon && <div className="text-muted">{icon}</div>}
      </div>
    </Card.Body>
  </Card>
);

export const LoadingSpinner = () => (
  <div className="text-center">
    <Spinner animation="border" />
    <p className="mt-2">Loading report data...</p>
  </div>
); 