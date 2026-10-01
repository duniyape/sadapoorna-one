import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Change only this one URL to point all API calls to a different server
const API_BASE_URL = 'https://api.sadapoorna.in/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Sadapoorna',
        short_name: 'Sadapoorna',
        description: 'Sadapoorna Business Suite',
        theme_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        id: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    allowedHosts: true,
    proxy: {
      // Single catch-all proxy — all API requests go to API_BASE_URL
      // location removed temporarily per user request
      '^/(branches|masters|users|auth|data-access-hierarchy|access|customer|customers|product-units|attributes|products|variants|get|packing-types|whatsapp|whatsapp-webhook|warehouses|vehicles|vendors|orders|inventory|beats|accounting)/': {
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
