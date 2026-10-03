import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  const API_BASE_URL = env.VITE_API_URL || ''

  return {
    plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
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
            src: 'favicon.png',
            sizes: '512x512',
            type: 'image/png',
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
      // added location back to proxy
      '^/(addresses|location|branches|masters|users|auth|data-access-hierarchy|access|customer|customers|product-units|attributes|products|variants|get|packing-types|whatsapp|whatsapp-webhook|warehouses|vehicles|vendors|orders|inventory|beats|accounting)(\\/|\\?|$)': {
        target: API_BASE_URL,
        changeOrigin: true,
        ws: true,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        bypass: (req, res, options) => {
          // If it's a browser navigation request for HTML, don't proxy it.
          // This allows SPA routing (e.g. /orders) to work on hard refresh.
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            console.log('Skipping proxy for browser request:', req.url);
            return req.url;
          }
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        }
      },
    }
  }
  }
})
