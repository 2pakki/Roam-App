import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast process to any to avoid type error with missing cwd definition
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Prevents 'process is not defined' error in browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Optional: polyfill process.env if deeply needed, but API_KEY is usually enough
      'process.env': {}
    }
  }
})