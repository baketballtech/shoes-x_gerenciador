import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "./", // Garante que os arquivos sejam referenciados sem "/"
  plugins: [react()],
  build: {
    outDir: 'build_5', // Define a pasta de saída
    emptyOutDir: true, // Limpa a pasta antes do build
    rollupOptions: {
      output: {
        entryFileNames: 'index.js', // Nome do arquivo de entrada principal
        assetFileNames: '[name][extname]', // Mantém os assets sem subpastas
        chunkFileNames: '[name].js' // Nomeia os chunks de forma limpa
      }
    }
  }
})
