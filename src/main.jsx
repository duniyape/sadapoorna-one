import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Automatically prepend backend API URL to API endpoints in production
const originalFetch = window.fetch;
// Use the same base URL configured in your vite.config.js
const API_BASE_URL = 'https://api.sadapoorna.in'; 
const apiRegex = /^\/(branches|masters|users|auth|data-access-hierarchy|access|customer|customers|product-units|attributes|products|variants|get|packing-types|whatsapp|whatsapp-webhook|warehouses|vehicles|vendors|orders|inventory|beats|accounting|location)(\/|$)/;

window.fetch = async (input, init) => {
  if (typeof input === 'string' && apiRegex.test(input)) {
    // Combine the base URL with the relative path
    input = API_BASE_URL + input;
  }
  return originalFetch(input, init);
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
