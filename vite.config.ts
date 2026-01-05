import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use '.' to refer to current directory to avoid potential path issues
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Explicitly define the API key
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevent crash if a library tries to access process.env.NODE_ENV or similar
      'process.env': JSON.stringify({}) 
    }
  }
})