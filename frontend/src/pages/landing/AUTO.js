import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../../components_part/Sidebar_visitors"; // Import Sidebar Component
import Footer from "../../components_part/Footer";
import UserHeader from "../../components_part/user_header";
import Login_Signup from "../../components_part/Login_Signup";
const HomePage = () => {
  const [show, setShow] = useState(false);

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
                    {/* User 1 */}

                    <Login_Signup />
                    
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
