import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' 
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @src deb yozsak shundoq portfolio papkasiga boradi
      '@src': path.resolve(__dirname, './src'),
      // @admin deb yozsak shundoq admin panel papkasiga boradi
      '@admin': path.resolve(__dirname, './admin'),
    },
  },
})