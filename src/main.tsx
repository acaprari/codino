import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Aurora feature flag: ?ui=aurora applies the new design system globally.
// Once the redesign is the default, this branch becomes unconditional.
if (new URLSearchParams(window.location.search).get('ui') === 'aurora') {
  document.body.classList.add('aurora-mode');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
