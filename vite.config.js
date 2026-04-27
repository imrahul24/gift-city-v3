import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Custom plugin: treat .geojson as JSON module
function geojsonPlugin() {
  return {
    name: 'vite-plugin-geojson',
    transform(src, id) {
      if (id.endsWith('.geojson')) {
        return { code: `export default ${src}`, map: null }
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), geojsonPlugin()],
  server: { port: 5173 }
})