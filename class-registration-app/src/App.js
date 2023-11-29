import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Home from './components/Home';
import Classes from './components/Classes';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import CalorieCalculator from './components/CalorieCalculator'; // Import the CalorieCalculator component
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/classes"
              element={
                <PrivateRoute>
                  <Classes />
                </PrivateRoute>
              } 
            />
      
            <Route 
              path="/calorie-calculator"
              element={
                <PrivateRoute>
                  <CalorieCalculator />
                </PrivateRoute>
              } 
            />
            {/* Add more private routes as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
