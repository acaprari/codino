import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

document.body.classList.add('aurora-mode');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
