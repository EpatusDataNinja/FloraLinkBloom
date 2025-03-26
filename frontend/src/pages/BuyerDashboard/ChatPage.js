import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../../components_part/header";
import Sidebar from "../../components_part/DashboardSidebar";
import Chat from "../../components_part/chat";

const ChatPage = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="dashboard-layout">
      <Header setShow={setShow} />
      <div className="dashboard-container">
        <Sidebar show={show} setShow={setShow} />
        <div className="dashboard-main">
          <div className="dashboard-content">
            <Chat />
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .dashboard-layout {
          min-height: 100vh;
          background-color: whitesmoke;
          position: relative;
        }

        .dashboard-container {
          display: flex;
          height: calc(100vh - 70px);
          margin-top: 70px;
          position: relative;
          overflow: hidden;
        }

        .dashboard-main {
          flex: 1;
          margin-left: 280px;
          padding: 2rem;
          transition: margin-left 0.3s ease;
          overflow: hidden;
          height: 100%;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
          height: 100%;
          position: relative;
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
            width: 100%;
            padding: 1rem;
          }

          .dashboard-container {
            margin-top: 60px;
            height: calc(100vh - 60px);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
