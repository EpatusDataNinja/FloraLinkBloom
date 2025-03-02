import React, { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import User from "../components_part/userstatistics";
const Sidebar = ({ show, setShow }) => {
  const [activeItem, setActiveItem] = useState("Overview");


  return (
    <>
      {/* Sidebar for larger screens */}
      
      <aside className="col-md-3 d-none d-md-block bg-white sidebar">
      <p className="bg-success" style={{backgroundColor:'',color:'white',marginTop:'0.3cm',fontSize:'19px',padding:'0.4cm',borderRadius:'10px'}}>Choouse your Grower/glorist</p>
      <User/>
      </aside>

      {/* Offcanvas Sidebar for small screens */}
      <Offcanvas show={show} onHide={() => setShow(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <h5>Choouse your Grower/glorist</h5>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
        <User/>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;
