import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use '.' to refer to current directory instead of process.cwd() to avoid type issues
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env for libs that might expect it, though usually not needed
      'process.env': {} 
    }
  }
})