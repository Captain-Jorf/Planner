import { defineConfig } from 'vite'

// Base './' so the built assets load with relative paths inside a Capacitor
// WebView (file://) and also work behind the Arena live-preview proxy.
export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // Allow the Arena preview proxy host (*.e2b.app) to reach the dev server.
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    target: 'es2018',
    cssCodeSplit: false,
  },
})
