import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../../components_part/header";
import Sidebar from "../../components_part/DashboardSidebar";
import BuyerOverview from "./dashboard";

const BuyerOverviewPage = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="dashboard-layout">
      <Header setShow={setShow} />
      <div className="dashboard-container">
        <Sidebar show={show} setShow={setShow} />
        <main className="dashboard-main">
          <div className="dashboard-content">
            <BuyerOverview />
          </div>
        </main>
      </div>

      <style jsx="true">{`
        .dashboard-layout {
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .dashboard-container {
          display: flex;
          min-height: calc(100vh - 70px);
          margin-top: 70px;
        }

        .dashboard-main {
          flex: 1;
          margin-left: 280px;
          padding: 2rem;
          transition: margin-left 0.3s ease;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BuyerOverviewPage; 