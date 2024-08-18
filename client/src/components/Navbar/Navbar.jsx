import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { AiOutlineDashboard } from "react-icons/ai";
import { IoPeopleOutline } from "react-icons/io5";
import { CiUser, CiLogout } from "react-icons/ci";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { useState } from 'react';
import { MdSell } from "react-icons/md";



export default function Navbar() {
  // Retrieve initial state from local storage or default to true 
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggle = () => {
    setIsOpen(prevState => {
      const newState = !prevState;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  const sideBar = [
    { path: '/dashboard', name: "Dashboard", icon: <AiOutlineDashboard /> },
    { path: '/products', name: "Inventory", icon: <MdOutlineProductionQuantityLimits /> },
    { path: '/pos', name: "POS", icon: <MdSell /> },
    { path: '/employee', name: "Employees", icon: <CiUser /> },
    { path: '/users', name: "Users", icon: <IoPeopleOutline /> },
    { path: '/', name: "Logout", icon: <CiLogout /> },
  ];

  return (
    <div className="side-container">
      <div className="sidebar" style={{ width: isOpen ? "200px" : "50px", height: isOpen? "100vh": "100vh" }}>
        <div className="top-section">
          <img src="bb.svg" className='sidebar-logo' style={{ display: isOpen ? "block" : "none" }} />
          <div className="bars" style={{ marginLeft: isOpen ? "30px" : "0px", marginTop: isOpen? "0px": "55px" }}>
            <RxHamburgerMenu onClick={toggle} />
          </div>
        </div>

        {
          sideBar.map((item, index) => (
            <NavLink to={item.path} key={index} className="link" activeclassname="active">
              <div className="icon">{item.icon}</div>
              <div style={{ display: isOpen ? "block" : "none"}} className="link-text">{item.name}</div>
            </NavLink>
          ))
        }

      </div>

    </div>
  );
}
