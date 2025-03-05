import React from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa";

const UserHeader = ({ setShow }) => {
  return (
    <nav style={{ background: 'white', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#15803d', margin: 0 }}>FloraLink</h1>
        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>"Blooming Connections"</span>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/register?role=seller" style={{ color: '#15803d', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '500' }}>
          Become a Grower/Florist
        </Link>
        <Link to="/register?role=buyer" style={{ color: '#15803d', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '500' }}>
          Become a Buyer
        </Link>
      </div>

      <div style={{ position: 'relative', width: '16rem' }}>
        <input type="text" placeholder="Search..." style={{ width: '100%', padding: '0.375rem 2rem 0.375rem 2rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem', fontSize: '0.875rem' }} />
        <FaSearch style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
      </div>

      <ul style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
        <li><Link to="/" style={{ color: '#374151', textDecoration: 'none', transition: 'color 0.2s' }}>Home</Link></li>
        <li><Link to="/about" style={{ color: '#374151', textDecoration: 'none', transition: 'color 0.2s' }}>About</Link></li>
        <li><Link to="/services" style={{ color: '#374151', textDecoration: 'none', transition: 'color 0.2s' }}>Services</Link></li>
        <li><Link to="/contact" style={{ color: '#374151', textDecoration: 'none', transition: 'color 0.2s' }}>Contact</Link></li>
        <li>
          <Link to="/login" style={{ 
            backgroundColor: '#15803d', 
            color: 'white', 
            padding: '0.5rem 1.5rem', 
            borderRadius: '9999px', 
            textDecoration: 'none', 
            transition: 'all 0.2s',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Login
          </Link>
        </li>
        <li>
          <button style={{ position: 'relative', background: 'none', border: 'none', color: '#374151', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem', transition: 'color 0.2s' }} onClick={() => setShow(true)}>
            <FaShoppingCart />
            <span style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', backgroundColor: '#dc2626', color: 'white', fontSize: '0.75rem', padding: '0.125rem 0.375rem', borderRadius: '9999px' }}>0</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default UserHeader;