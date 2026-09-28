import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const BACKEND_URL = 'http://192.168.29.145:8000'  // trailing slash nahi

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      // /auth/..., /customer/..., /orders/..., /products/..., /accounting/...
      // sab backend pe forward ho jayenge
      '^/(auth|customer|orders|products|accounting)': {
        target: BACKEND_URL,
        changeOrigin: true,
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
