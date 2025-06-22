import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import SimpleApp from './SimpleApp.tsx';
import './index.css';

// Use SimpleApp for testing, switch back to App when auth is fixed
const USE_SIMPLE_APP = false; // Set to true to bypass auth issues

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {USE_SIMPLE_APP ? <SimpleApp /> : <App />}
  </StrictMode>
);
