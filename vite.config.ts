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
    target: 'es2020'
  },
  optimizeDeps: {
    esbuildOptions : {
      target: "es2020"
    }
  }
})
