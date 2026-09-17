import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: fileURLToPath(new URL('../../dist/douyin', import.meta.url)),
  server: { host: '127.0.0.1', port: 5174, strictPort: true },
  build: { outDir: '../../dist/douyin-preview', emptyOutDir: true },
})
