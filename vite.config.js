import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Change only this one URL to point all API calls to a different server
const API_BASE_URL = 'http://192.168.29.145:8000/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: true,
    proxy: {
      // Single catch-all proxy — all API requests go to API_BASE_URL
      '^/(branches|masters|users|auth|data-access-hierarchy|access|customer|customers|product-units|attributes|products|variants|get|packing-types|whatsapp|whatsapp-webhook|warehouses|vehicles|vendors|orders|inventory|beats|accounting|location)/': {
        target: API_BASE_URL,
        changeOrigin: true,
        ws: true,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        }
      },
    }
  }
})
