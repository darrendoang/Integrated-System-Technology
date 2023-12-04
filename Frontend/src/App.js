import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Home from './components/Home';
import Classes from './components/Classes';
import Coaches from './components/Coach';
import AdminHome from './components/AdminHome';
import AdminClasses from './components/AdminClasses';
import AdminCoaches from './components/AdminCoaches';
import AdminUsers from './components/AdminUsers';
import Register from './components/Register';
import AdminRegistrations from './components/AdminRegistrations';
import PrivateRoute from './components/PrivateRoute';
import AdminAlert from './components/AdminAlert';
import CalorieCalculator from './components/CalorieCalculator'; // Import the CalorieCalculator component
import './App.css';
 

const App = () => {

  return (
    <Router>
      <div className="app">
        <Sidebar/>
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
              path="/admin-alert"
              element={
                <PrivateRoute>
                  <AdminAlert />
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

              <Route 
              path="/coaches"
              element={
                <PrivateRoute>
                  <Coaches />
                </PrivateRoute>
              } 
            />

<Route 
  path="/admin-classes"
  element={
    <PrivateRoute adminOnly>
      <AdminClasses />
    </PrivateRoute>
  } 
/>
<Route 
  path="/admin-coaches"
  element={
    <PrivateRoute adminOnly>
      <AdminCoaches />
    </PrivateRoute>
  } 
/>
<Route 
  path="/admin-users"
  element={
    <PrivateRoute adminOnly>
      <AdminUsers />
    </PrivateRoute>
  } 
/>
<Route 
  path="/admin-home"
  element={
    <PrivateRoute adminOnly>
      <AdminHome />
    </PrivateRoute>
  } 
/>
<Route 
  path="/admin-registrations"
  element={
    <PrivateRoute adminOnly>
      <AdminRegistrations />
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
