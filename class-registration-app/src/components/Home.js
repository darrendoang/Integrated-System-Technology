// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const goToClasses = () => {
    navigate('/classes'); // This function will navigate to the /classes route
  };

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page of the Fitness Coaching App!</p>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={goToClasses}>See Available Classes</button> {/* This is the new button */}
    </div>
  );
};

export default Home;
