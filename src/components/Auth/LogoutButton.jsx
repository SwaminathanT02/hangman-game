// client/src/components/Auth/LogoutButton.jsx
import React from 'react';

const LogoutButton = ({ onLogout }) => {
  const handleLogout = () => {
    // Perform logout actions if necessary
    onLogout();
  };

  return <button className="logout-button" onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
