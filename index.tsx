import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeData } from './services/api';

// Initialize mock database with Admin user if empty
initializeData();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);