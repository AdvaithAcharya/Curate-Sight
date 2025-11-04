import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'CurateSight – AI Museum Scanner',
        short_name: 'CurateSight',
        theme_color: '#f8f5f0',
        background_color: '#f8f5f0',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/vite.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/vite.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // Cache API calls (works with proxy or same-origin in prod)
            urlPattern: ({url}) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 3 }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'image-cache' }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    // Configure HMR for tunnels (cloudflared/ngrok). Set envs before running dev:
    //   VITE_HMR_HOST=<your-tunnel-host>  (e.g., xxxx.trycloudflare.com)
    //   VITE_HMR_PORT=443
    //   VITE_HMR_PROTOCOL=wss
    hmr: {
      protocol: process.env.VITE_HMR_PROTOCOL || undefined,
      host: process.env.VITE_HMR_HOST || undefined,
      clientPort: process.env.VITE_HMR_PORT ? Number(process.env.VITE_HMR_PORT) : undefined,
    },
    // Allow external hostnames during dev (required when requests come via tunnel hostname)
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  }
})
