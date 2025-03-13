// ReportLayout.js
import React, { useState } from "react";
import Header from "../../../components_part/header";
import Sidebar from "../../../components_part/DashboardSidebar";
import ErrorBoundary from "../../../components/ErrorBoundary";
import { printStyles } from '../../../styles/PrintStyles';

// Add debug logging
console.log('Loading ReportLayout component');

const ReportLayout = ({ children }) => {
  const [show, setShow] = useState(false);

  console.log('Rendering ReportLayout with children:', children);

  return (
    <div className="dashboard-layout">
      <Header setShow={setShow} />
      <div className="dashboard-container">
        <div className="sidebar-wrapper">
          <Sidebar show={show} setShow={setShow} />
        </div>
        <div className="dashboard-main">
          <div className="dashboard-content">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
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
          position: relative;
        }

        .sidebar-wrapper {
          position: fixed;
          top: 70px;
          left: 0;
          bottom: 0;
          width: 280px;
          z-index: 1000;
        }

        .dashboard-main {
          flex: 1;
          margin-left: 280px;
          padding: 2rem;
          transition: margin-left 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .sidebar-wrapper {
            transform: translateX(${show ? '0' : '-100%'});
            transition: transform 0.3s ease;
          }

          .dashboard-main {
            margin-left: 0;
            width: 100%;
            padding: 1rem;
          }
        }
      `}</style>

      <style type="text/css" media="print">
        {printStyles}
      </style>
    </div>
  );
};

console.log('ReportLayout component defined:', ReportLayout);
export default ReportLayout;