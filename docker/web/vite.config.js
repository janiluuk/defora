import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const apiPort = process.env.DEFORA_API_PORT || '3999'
const apiOrigin = process.env.DEFORA_API_ORIGIN || `http://127.0.0.1:${apiPort}`

export default defineConfig({
  plugins: [vue()],
  root: 'src',
  build: {
    outDir: resolve(__dirname, 'public'),
    // Keep vr.html and other non-Vite assets in public/
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': apiOrigin,
      '/freecut': apiOrigin,
      '/hls': apiOrigin,
      '/uploads': apiOrigin,
      '/frames': apiOrigin,
      '/ws': {
        target: apiOrigin.replace(/^http/, 'ws'),
        ws: true,
      },
    },
  },
})
