import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../../components_part/header";
import Sidebar from "../../components_part/DashboardSidebar";
import Profile from "../../components_part/profile";

const Dashboard = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="dashboard-layout">
      <Header setShow={setShow} />
      <div className="dashboard-container">
        <Sidebar show={show} setShow={setShow} />
        <div className="dashboard-main">
          <div className="dashboard-content">
            <div className="profile-section">
              <Profile />
            </div>
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
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .profile-section {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
            width: 100%;
            padding: 1rem;
          }

          .profile-section {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
