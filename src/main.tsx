import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import SimpleApp from './SimpleApp.tsx';
import './index.css';

// Initialize theme on app load
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Initialize theme immediately
initializeTheme();

// Use SimpleApp for testing, switch back to App when auth is fixed
const USE_SIMPLE_APP = false; // Set to true to bypass auth issues

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {USE_SIMPLE_APP ? <SimpleApp /> : <App />}
  </StrictMode>
);
