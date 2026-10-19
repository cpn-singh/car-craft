import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';

// React starts the app by rendering the main App component into #root.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
