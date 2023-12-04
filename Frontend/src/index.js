// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from "@chakra-ui/react";
import { UserProvider } from './components/UserContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <UserProvider>
  <ChakraProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </ChakraProvider>
  </UserProvider>
);
reportWebVitals();

