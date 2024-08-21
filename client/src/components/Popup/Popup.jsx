import React from 'react';
import './Popup.css'; // Add appropriate styling

const Popup = ({ trigger, setTrigger, children, className }) => {
  return (
    <div className={`popup ${trigger ? 'active' : ''} ${className}`}>
      <div className="popup-inner">
        <button className="close-btn" onClick={() => setTrigger(false)}>&#x2715;</button>
        {children}
      </div>
    </div>
  );
};

export default Popup;