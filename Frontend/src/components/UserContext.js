import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

  // Call this function when you update the user's role
  const updateUserRole = (role) => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
  };

  return (
    <UserContext.Provider value={{ userRole, updateUserRole }}>
      {children}
    </UserContext.Provider>
  );
};
