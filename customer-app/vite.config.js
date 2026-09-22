import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const BACKEND_URL = 'http://192.168.29.145:8000'  // trailing slash nahi

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // /auth/..., /customer/..., /orders/..., /products/..., /accounting/...
      // sab backend pe forward ho jayenge
      '^/(auth|customer|orders|products|accounting)': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    }
  }
})
