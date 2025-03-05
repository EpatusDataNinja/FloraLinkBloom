import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../../components_part/Sidebar_visitors"; // Import Sidebar Component
import Footer from "../../components_part/Footer";
import UserHeader from "../../components_part/user_header";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  return (
    <div className="dashboard" style={{ backgroundColor: "whitesmoke" }}>
      {/* <Header setShow={setShow} /> */}
      <UserHeader setShow={setShow} />

      <div className="container-fluid">
        <div className="row">
          <Sidebar show={show} setShow={setShow} />
          <main className="col-md-9  allcontent">
            <div className="row">
              {/* User Product Cards */}
              <section className="product-section" style={{backgroundImage:'linear-gradient(to right, green, #34DE2B)'}}>
                <div className="container">
                  <div className="row">
                    {/* Removed Login_Signup component as we now redirect to /login */}
                    <Footer/>
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

export default HomePage;
