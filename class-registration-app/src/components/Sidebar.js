// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Make sure to create this CSS file

const Sidebar = () => {
  return (
    <div className="sidebar">
      <NavLink to="/home" className="nav-link" activeClassName="active">
        Home
      </NavLink>
      <NavLink to="/classes" className="nav-link" activeClassName="active">
        Classes
      </NavLink>
      {/* Add more navigation links here */}
    </div>
  );
};

export default Sidebar;
