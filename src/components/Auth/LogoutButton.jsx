// client/src/components/Auth/LogoutButton.jsx
import React from 'react';
import axios from 'axios';

const LogoutButton = ({ onLogout, serverURL }) => {
  const handleLogout = async () => {
    try {
      await axios.post(`${serverURL}/api/user/logout`);
      onLogout();
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return <button className="logout-button" onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
