import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Offcanvas } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import Header from "../../components_part/header";
import Sidebar from "../../components_part/DashboardSidebar"; // Import Sidebar Component

const Dashboard = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  return (
    <div className="dashboard" style={{ backgroundColor: "whitesmoke" }}>
      <Header setShow={setShow} />
      {/* <UserHeader setShow={setShow} /> */}

      <div className="container-fluid">
        <div className="row">
          <Sidebar show={show} setShow={setShow} />
          <main className="col-md-10  allcontent">
            <div className="row">
              {/* User Product Cards */}
              <section className="product-section">
                <div className="container">
                  <div className="row">
                    {/* User 1 */}

                    
                    
                    {/* <Footer/> */}
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
