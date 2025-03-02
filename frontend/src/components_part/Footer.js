import React from "react";

const Footer = () => {
  return (
    <footer className="bg-success text-light py-4 mt-5" style={{borderRadius:'0.3cm'}}>
      <div className="container" style={{borderRadius:'0.3cm'}}>
        <div className="row">
          {/* About Section */}
          <div className="col-md-4">
            <h5>About FloraLink</h5>
            <p>
              Connecting growers, florists, and buyers for fresh and vibrant
              flowers.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="#" className="text-light text-decoration-none">About Us</a></li>
              <li><a href="#" className="text-light text-decoration-none">Services</a></li>
              <li><a href="#" className="text-light text-decoration-none">Contact</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="col-md-4">
            <h5>Contact Us</h5>
            <p>Email: support@floralink.com</p>
            <p>Phone: +123 456 7890</p>
          </div>
        </div>

        <div className="text-center mt-3">
          <p className="mb-0">© 2024 FloraLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
