// /// <reference types="vitest" />

// import legacy from '@vitejs/plugin-legacy'
// import react from '@vitejs/plugin-react'
// import { defineConfig, optimizeDeps } from 'vite'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),    
//     legacy()
//   ],
//   optimizeDeps: {
//       exclude: ["onnxruntime-web"],
//   },
//   test: {
//     globals: true,
//     environment: 'jsdom',
//     setupFiles: './src/setupTests.ts',
//   },
//   server:{
//     headers:{
//       // Diperlukan untuk SharedArrayBuffer (backend WASM threaded)
//       "Cross-Origin-Opener-Policy": "same-origin",
//       "Cross-Origin-Embedder-Policy": "require-corp",
//     }
//   }
// })

/// <reference types="vitest" />
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),    
    legacy()
  ],
  optimizeDeps: {
      // Biarkan ini ada untuk kebutuhan saat dev
      exclude: ["onnxruntime-web"], 
  },
  build: {
    // TAMBAHKAN BAGIAN INI
    rollupOptions: {
      external: ['onnxruntime-web'],
    },
    // Opsional: Meningkatkan batas ukuran warning jika model Anda di-bundle
    chunkSizeWarningLimit: 2000, 
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  server:{
    headers:{
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    }
  }
})