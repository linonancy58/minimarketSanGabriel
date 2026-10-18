import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Genera favicon, apple-touch-icon e íconos PWA (incluido maskable) a partir de public/logo.svg
// Uso: npm run icons
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0.1, resizeOptions: { background: '#065f46' } },
    apple: { ...minimal2023Preset.apple, padding: 0.1, resizeOptions: { background: '#065f46' } },
  },
  images: ['public/logo.svg'],
})
