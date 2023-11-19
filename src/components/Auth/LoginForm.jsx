// client/src/components/Auth/LoginForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onLogin, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setLoginError('Username and password are required.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5001/api/user/login', {
        username,
        password,
      });
  
      onLogin(response.data); // Update user state in the parent component
    } catch (error) {
      console.error('Error logging in:', error.message);
      setLoginError('Invalid credentials. Please check your username and password.');
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError('Username and password are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/user/register', {
        username,
        password,
      });
      try {
        await axios.post(`http://localhost:5001/api/leaderboard`, {
          username: username,
          score: 0,
        });
      } catch (error) {
        console.error('Error including new user in leaderboard:', error.message);
      }
      onRegister(response.data); // Update user state in the parent component
    } catch (error) {
      console.error('Error registering user:', error.message);
      setLoginError('Username already taken! Please retry with another username!');
    }
  };
  

  return (
    <form className="login-form" onSubmit={(e) => e.preventDefault()}>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <br />
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <br />
      <div className="button-container">
        <button className="login-button" type="button" onClick={handleLogin}>
          Login
        </button>
        <button className="register-button" type="button" onClick={handleRegister}>
          Register
        </button>
      </div>

      {loginError && <p className="error-message">{loginError}</p>}
    </form>
  );
};

export default LoginForm;
