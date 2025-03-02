import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../../components_part/header";
import Sidebar from "../../components_part/DashboardSidebar"; // Import Sidebar Component
import AdminDashboard from "./dashboard";
const Dashboard = () => {
  const [show, setShow] = useState(false);

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

                    <AdminDashboard/>
                    
                    
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
