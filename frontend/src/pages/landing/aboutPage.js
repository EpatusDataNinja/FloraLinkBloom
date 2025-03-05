import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import UserHeader from "../../components_part/user_header";
import About from "./Accounts_Auto/about";
import Footer from "../../components_part/Footer";

const AboutPage = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="page-container">
      <UserHeader setShow={setShow} />
      <main className="main-content">
        <About />
        <Footer />
      </main>

      <style jsx="true">{`
        .page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #15803d, #84cc16);
        }
        .main-content {
          padding: 2rem 1rem;
          min-height: calc(100vh - 68px);
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
