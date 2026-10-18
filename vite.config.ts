import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // El usuario decide cuándo actualizar (ver components/PwaPrompts.tsx)
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'logo.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: '/',
        name: 'San Gabriel · Gestión de Inventarios',
        short_name: 'San Gabriel',
        description: 'Inventario, ventas y compras de Minimarkets San Gabriel S.A.C.',
        lang: 'es-PE',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'any',
        background_color: '#0b1220',
        theme_color: '#0b1220',
        categories: ['business', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Punto de venta', url: '/pos', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Stock', url: '/inventario/stock', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Dashboard', url: '/dashboard', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        // La API de Supabase siempre va a la red (datos de inventario deben ser frescos).
        // Solo cacheamos imágenes públicas del storage (avatares).
        runtimeCaching: [
          {
            urlPattern: /\/storage\/v1\/object\/public\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'sg-storage',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { port: 5173 },
})
