import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Automatically prepend backend API URL to API endpoints in production (via env variables)
const originalFetch = window.fetch;
// In development, this is empty, so relative URLs hit the Vite Proxy.
// In production, set VITE_API_URL in your deployment platform (e.g., Netlify/Vercel).
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const apiRegex = /^\/(addresses|branches|masters|users|auth|data-access-hierarchy|access|customer|customers|product-units|attributes|products|variants|get|packing-types|whatsapp|whatsapp-webhook|warehouses|vehicles|vendors|orders|inventory|beats|accounting)(\/|\?|$)/;

window.fetch = async (input, init) => {
  if (typeof input === 'string' && apiRegex.test(input) && API_BASE_URL) {
    // Combine the base URL with the relative path ONLY if API_BASE_URL is set
    input = API_BASE_URL + input;
  }

  const response = await originalFetch(input, init);

  // Globally handle token expiration (401 Unauthorized)
  if (response.status === 401 && window.location.pathname !== '/login') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return response;
};

// Disable scroll wheel changing number inputs globally
document.addEventListener('wheel', (e) => {
  if (document.activeElement.type === 'number') {
    document.activeElement.blur();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
