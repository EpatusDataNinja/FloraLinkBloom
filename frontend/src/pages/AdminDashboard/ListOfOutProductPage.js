import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../../components_part/header";
import Sidebar from "../../components_part/DashboardSidebar";
import ListOfOutProduct from "./ListOfOutProduct";

const Dashboard = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="dashboard-layout">
      <Header setShow={setShow} />
      <div className="dashboard-container">
        <Sidebar show={show} setShow={setShow} />
        <div className="dashboard-main">
          <div className="dashboard-content">
            <ListOfOutProduct />
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .dashboard-layout {
          min-height: 100vh;
          background-color: whitesmoke;
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
          overflow-x: hidden;
        }

        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        @media (max-width: 1200px) {
          .dashboard-content {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
            padding: 1rem;
          }
          
          .dashboard-content {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 