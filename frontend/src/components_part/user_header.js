import {FaBars } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";

const Header = ({ setShow, isLoggedIn }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Refs for dropdown and mobile menu
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);

    // Close dropdown and mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                menuRef.current && !menuRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        console.log("Logging out...");
        navigate("/login");
    };

    return (
        <>
            <header className="top-bar d-flex justify-content-between align-items-center p-3 bg-light">
                <div className="d-flex align-items-center">
                    {/* Sidebar Toggle for Small Screens */}
                    <button className="btn btn-light d-md-none me-3" onClick={() => setShow(true)}>☰</button>

                    {/* Brand */}
                    <div className="d-flex flex-column ms-3">
                        <h2 className="mb-0 text-success">FloraLink</h2>
                        <span className="fw-light">
                            {isLoggedIn ? (
                                <Link to="/auto" className="text-dark text-decoration-none">
                                    "Dashboard"
                                </Link>
                            ) : (
                                <Link to="/auto" className="text-dark text-decoration-none">
                                    "Blooming Connections"
                                </Link>
                            )}
                        </span>

                    </div>
                </div>

                {/* Search Bar (Only Visible on Medium+ Screens) */}
                <input type="text" className="form-control w-50 d-none d-md-block" placeholder="Search..." />

                <div className="d-flex align-items-center position-relative">

                    {/* Public Menus for Non-Logged-in Users */}
                    <nav className="d-none d-md-flex">
                        <Link to="/" className="text-success mx-3 text-decoration-none">Home</Link>
                        <Link to="/about" className="text-success mx-3 text-decoration-none">About</Link>
                        <Link to="/contact" className="text-success mx-3 text-decoration-none">Contact</Link>
                       
                    </nav>

                    {/* Second Menu Button for Small Screens */}
                    <button className="btn btn-light d-md-none ms-3" onClick={() => setMenuOpen(!menuOpen)}>
                        <FaBars />
                    </button>

                    {/* Mobile Menu */}
                    {menuOpen && (
                        <div ref={menuRef} className="position-absolute end-0 mt-3 bg-light shadow-sm rounded p-1" style={{ width: "180px", zIndex: 1000 }}>
                            <ul className="list-unstyled mb-0 text-center">
                                <li><Link to="/" className="text-dark d-block p-2">Home</Link></li>
                                <li><Link to="/about" className="text-dark d-block p-2">About</Link></li>
                                <li><Link to="/contact" className="text-dark d-block p-2">Contact</Link></li>
                               
                            </ul>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
};

export default Header;
