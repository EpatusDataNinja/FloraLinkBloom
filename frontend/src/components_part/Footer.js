import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-green-600 text-white p-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">About FloraLink</h3>
          <p>Connecting growers, florists, and buyers for fresh and vibrant flowers.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:text-green-300">About Us</Link></li>
            <li><Link to="/services" className="hover:text-green-300">Services</Link></li>
            <li><Link to="/contact" className="hover:text-green-300">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <p>Email: support@floralink.com</p>
          <p>Phone: +123 456 7890</p>
        </div>
      </div>
      <div className="text-center mt-8">
        <p>&copy; 2024 FloraLink. All rights reserved.</p>
      </div>

      <style jsx="true">{`
        footer {
          background-color: #16a34a;
          color: white;
          padding: 2rem;
          width: 100%;
        }
        .grid {
          display: grid;
          gap: 2rem;
        }
        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .hover\\:text-green-300:hover {
          color: #86efac;
        }
        h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin-bottom: 0.5rem;
        }
        a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s;
        }
        .text-center {
          text-align: center;
        }
        .mt-8 {
          margin-top: 2rem;
        }
      `}</style>
    </footer>
  );
};

export default Footer;