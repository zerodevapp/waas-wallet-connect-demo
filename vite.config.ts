import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills(),
    react()
  ],
  build: {
    target: 'es2020',
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'viem-vendor': ['viem', '@zerodev/sdk', '@zerodev/waas'],
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions : {
      target: "es2020"
    }
  }
})
