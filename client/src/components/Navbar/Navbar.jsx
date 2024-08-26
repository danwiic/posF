import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { AiOutlineDashboard } from "react-icons/ai";
import { IoPeopleOutline } from "react-icons/io5";
import { CiUser, CiLogout } from "react-icons/ci";
import { MdOutlineProductionQuantityLimits, MdSell } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { useState } from 'react';
import { useUser } from '../../Context/UserContext';
import axios from 'axios';
import { IoTodayOutline } from "react-icons/io5";



export default function Navbar({ children }) {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const { user } = useUser(); // Get user info from context
  const navigate = useNavigate(); 

  const toggle = () => {
    setIsOpen(prevState => {
      const newState = !prevState;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8800/logout'); 
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/'); 
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Define sidebar items based on user role
  const sideBar = user && user.role === 'admin' ? [
    { path: '/dashboard', name: "Dashboard", icon: <AiOutlineDashboard /> },
    { path: '/products', name: "Inventory", icon: <MdOutlineProductionQuantityLimits /> },
    { path: '/pos', name: "POS", icon: <MdSell /> },
    { path: '/employee', name: "Employees", icon: <CiUser /> },
    { path: '/users', name: "Administrator", icon: <IoPeopleOutline /> },
    { path: '#', name: "Logout", icon: <CiLogout />, onClick: handleLogout },
  ] : [
    { path: '/today', name: "Today's Sale", icon: <IoTodayOutline /> },
    { path: '/pos', name: "POS", icon: <MdSell /> },
    { path: '#', name: "Logout", icon: <CiLogout />, onClick: handleLogout },
  ];

  return (
    <div className="side-container">
      <div className="sidebar" style={{ width: isOpen ? "200px" : "50px", height: "100vh" }}>
        <div className="top-section">
          <img src="bb.svg" className='sidebar-logo' style={{ display: isOpen ? "block" : "none" }} />
          <div className="bars" style={{ marginLeft: isOpen ? "30px" : "0px", marginTop: isOpen ? "0px" : "55px" }}>
            <RxHamburgerMenu onClick={toggle} />
          </div>
        </div>

        {
          sideBar.map((item, index) => (
            item.name === "Logout" ? (
              <div
                key={index}
                className="link"
                onClick={item.onClick} // Apply the logout click handler
              >
                <div className="icon">{item.icon}</div>
                <div style={{ display: isOpen ? "block" : "none" }} className="link-text">{item.name}</div>
              </div>
            ) : (
              <NavLink
                to={item.path}
                key={index}
                className="link"
                activeclassname="active"
              >
                <div className="icon">{item.icon}</div>
                <div style={{ display: isOpen ? "block" : "none" }} className="link-text">{item.name}</div>
              </NavLink>
            )
          ))
        }

      </div>
      {children}
    </div>
  );
}
