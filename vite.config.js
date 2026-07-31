import { defineConfig } from 'vite'

// Project Pages: https://<user>.github.io/odyssey/
export default defineConfig({
  base: '/odyssey/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
