import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/branches': {
        target: 'http://192.168.29.8:8000',
        changeOrigin: true,
      },
      '/masters': {
        target: 'http://192.168.29.8:8000',
        changeOrigin: true,
      },
      '^/users/(create|get|get-one|update|v1)': {
        target: 'http://192.168.29.8:8000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://192.168.29.8:8000',
        changeOrigin: true,
      },
      '^/data-access-hierarchy/': {
        target: 'http://192.168.29.8:8000',
        changeOrigin: true,
      },
      '^/access/': {
        target: 'http://192.168.29.8:8000',
        changeOrigin: true,
      },
      '^/customer/': {
        target: 'http://192.168.29.8:8000',
        changeOrigin: true,
      }
    }
  }
})
