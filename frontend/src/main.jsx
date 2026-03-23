import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; 
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>   {/* 👈 add this */}
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);