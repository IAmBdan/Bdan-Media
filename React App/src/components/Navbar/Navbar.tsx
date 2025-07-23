import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? 'auto' : 'hidden';
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo clickable" onClick={handleLogoClick}>
            <img src="/logo.png" alt="logo" />
          </div>
        </div>
      </nav>
      <button className={`menu-button ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
    </>
  );
};

export default Navbar;