import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  main: {
    entry: 'src/main/index.ts',
    vite: {
      build: {
        rollupOptions: {
          external: ['sqlite3', 'better-sqlite3']
        }
      }
    }
  },
  preload: {
    entry: 'src/preload/index.ts'
  },
  renderer: {
    root: '.',
    build: {
      outDir: 'dist/renderer'
    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})

