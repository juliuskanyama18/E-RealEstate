import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import { backendUrl } from './config/constants';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

// Render's free/hobby tier spins the backend down after a period of
// inactivity — the first real request after that (often a brand-new user's
// very first "Add Property"/"Add Tenant" submit) can time out entirely
// while the dyno cold-starts, which then succeeds on a simple retry with
// no code change. Firing this unauthenticated, rate-limit-exempt ping the
// moment the app loads gives the backend a head start waking up while the
// user is still on the login/register screen, well before they reach a
// real form submission.
if (backendUrl) {
  fetch(`${backendUrl}/status`).catch(() => {});
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
