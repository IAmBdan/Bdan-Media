import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import LandingPage from '../../pages/Landing/LandingPage';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <ul className="nav-links">
          <li><Link to="/" onClick={toggleSidebar}>Home</Link></li>
          <li><Link to="/work" onClick={toggleSidebar}>Work</Link></li>
          <li><Link to="/connect" onClick={toggleSidebar}>Connect</Link></li>
          <li><Link to="/about" onClick={toggleSidebar}>About</Link></li>

        </ul>
      </div>
      {/* Overlay */}
      <div
        className={`overlay ${isOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
      ></div>
    </>
  );
};

export default Sidebar;
