import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; 
const root = ReactDOM.createRoot(document.getElementById('root'));
import { SocketProvider } from "./context/SocketContext";

root.render(
  <React.StrictMode>
    
      <AuthProvider>
        <SocketProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
        </SocketProvider>
      </AuthProvider>
    
  </React.StrictMode>
);