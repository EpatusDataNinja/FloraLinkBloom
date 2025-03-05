import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Header from "../../components_part/header";
import Sidebar from "../../components_part/DashboardSidebar";
import Checkout from "./Checkout";

const CheckoutPage = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="d-flex">
        <Sidebar show={showSidebar} setShow={setShowSidebar} />
        <main className={`dashboard-main ${showSidebar ? "" : "expanded"}`}>
          <Container fluid className="py-4">
            <Row>
              <Col>
                <Checkout setShowMainSidebar={setShowSidebar} />
              </Col>
            </Row>
          </Container>
        </main>
      </div>

      <style jsx="true">{`
        .dashboard-container {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .dashboard-main {
          flex-grow: 1;
          transition: margin-left 0.3s ease-in-out;
          margin-left: ${showSidebar ? "250px" : "0"};
          min-height: calc(100vh - 60px);
        }
        .dashboard-main.expanded {
          margin-left: 0;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage; 