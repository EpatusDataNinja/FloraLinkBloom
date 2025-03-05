import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Offcanvas } from "react-bootstrap";

import Header from "../../components_part/header";
import Sidebar from "../../components_part/Sidebar_visitors"; // Import Sidebar Component
import Footer from "../../components_part/Footer";
import UserHeader from "../../components_part/user_header";
import Contact from "./Accounts_Auto/contact";
const HomePage = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="dashboard" style={{ backgroundColor: "whitesmoke" }}>
      {/* <Header setShow={setShow} /> */}
      <UserHeader setShow={setShow} />

      <div className="container-fluid">
        <div className="row">
          <Sidebar show={show} setShow={setShow} />
          <main className="col-md-9 ms-sm-auto px-md-4 main-content">
            <div className="content-wrapper">
              {/* Contact Section */}
              <section className="content-section">
                <Contact />
              </section>
              <Footer/>
            </div>
          </main>
        </div>
      </div>

      <style jsx="true">{`
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #15803d, #84cc16);
        }
        .main-content {
          margin-left: 320px;
          transition: margin-left 0.3s ease-in-out;
          padding-top: 2rem;
          min-height: calc(100vh - 68px);
        }
        .content-wrapper {
          background: transparent;
          border-radius: 12px;
          overflow: hidden;
        }
        .content-section {
          margin-bottom: 2rem;
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
