import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Change only this one URL to point all API calls to a different server
const API_BASE_URL = 'http://192.168.29.9:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Single catch-all proxy — all API requests go to API_BASE_URL
      '^/(branches|masters|users|auth|data-access-hierarchy|access|customer|product-units|attributes|products|variants|get|packing-types|whatsapp|warehouses|vehicles|vendors)/': {
        target: API_BASE_URL,
        changeOrigin: true,
      },
    }
  }
})
