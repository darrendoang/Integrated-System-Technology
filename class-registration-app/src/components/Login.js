import React, { useState } from 'react';
import axiosInstance from './axiosInstance';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook to access the navigate function

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axiosInstance.post('/login', {
        username,
        password,
      });

      localStorage.setItem('token', response.data.access_token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

      // Navigate to the home page
      navigate('/home');
    } catch (err) {
      setError(err.response ? err.response.data.detail : 'An unknown error occurred');
    }
  };




  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default Login;
