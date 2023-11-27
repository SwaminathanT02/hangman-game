// --- IMPORTS ---
import React, { useState } from 'react';
import GoogleIcon from '@mui/icons-material/Google';
import axios from 'axios';

const LoginForm = ({ onLogin, onRegister, serverURL }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setLoginError('Username and password are required.');
      return;
    }
  
    try {
      await axios.post(`${serverURL}/api/user/login`, {
        username,
        password,
      });
      window.location.reload();

    } catch (error) {
      console.error('Error logging in:', error.message);
      setLoginError('Invalid credentials. Please check your username and password.');
    }
  };
  
  const handleRegister = async (e) => {
    if (!username.trim() || !password.trim()) {
      setLoginError('Username and password are required.');
      return;
    }

    try {
      await axios.post(`${serverURL}/api/user/register`, {
        username,
        password,
      });
      try {
        await axios.post(`${serverURL}/api/leaderboard`, {
          username: username,
          score: 0,
        });
      } catch (error) {
        console.error('Error including new user in leaderboard:', error.message);
      }
      window.location.reload();
    } catch (error) {
      console.error('Error registering user:', error.message);
      setLoginError('Username already taken! Please retry with another username!');
    }
  };
  
  const handleGoogleLogin = async () => {
    window.open(`${serverURL}/auth/google`, "_self");
  };

  return (
    <form className="login-form">
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
        <button className="google-button" type="button" onClick={handleGoogleLogin}>
          <GoogleIcon />
        </button>
      </div>

      {loginError && <p className="error-message">{loginError}</p>}
    </form>
  );
};

export default LoginForm;
