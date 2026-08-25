import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import { backendUrl } from './config/constants';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

// Render's free/hobby tier spins the backend down after ~15 minutes with no
// HTTP traffic — the next request after that times out entirely while the
// dyno cold-starts, and only a manual retry a few seconds later succeeds.
// A single ping on page load only covers the very first action of a
// session; any gap of normal human reading/navigating/deciding-what-to-do-
// next between actions is enough for the backend to spin back down again,
// so every subsequent action independently hits the same cold start. Keep
// pinging on an interval for as long as the tab is open so the backend
// never gets the chance to go idle mid-session.
if (backendUrl) {
  const keepAlive = () => fetch(`${backendUrl}/status`).catch(() => {});
  keepAlive();
  setInterval(keepAlive, 5 * 60 * 1000); // well under Render's 15-minute idle window
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
