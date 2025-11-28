import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // 加载 Electron 环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    main: {
      entry: 'src/main/index.ts',
      vite: {
        build: {
          rollupOptions: {
            external: ['sqlite3', 'better-sqlite3']
          }
        },
        define: {
          'import.meta.env.VITE_APP_BASE_API': JSON.stringify(env.VITE_APP_BASE_API || '/prod-api'),
          'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || 'electron')
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
      },
      define: {
        'import.meta.env.VITE_APP_BASE_API': JSON.stringify(env.VITE_APP_BASE_API || '/prod-api'),
        'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || 'electron'),
        'import.meta.env.VITE_APP_CONTEXT_PATH': JSON.stringify(env.VITE_APP_CONTEXT_PATH || '/'),
        'import.meta.env.VITE_APP_MONITRO_ADMIN': JSON.stringify(env.VITE_APP_MONITRO_ADMIN || ''),
        'import.meta.env.VITE_APP_POWERJOB_ADMIN': JSON.stringify(env.VITE_APP_POWERJOB_ADMIN || ''),
        'import.meta.env.VITE_APP_CLIENT_ID': JSON.stringify(env.VITE_APP_CLIENT_ID || ''),
        'import.meta.env.VITE_APP_RSA_PUBLIC_KEY': JSON.stringify(env.VITE_APP_RSA_PUBLIC_KEY || ''),
        'import.meta.env.VITE_APP_RSA_PRIVATE_KEY': JSON.stringify(env.VITE_APP_RSA_PRIVATE_KEY || ''),
        'import.meta.env.VITE_APP_WEBSOCKET': JSON.stringify(env.VITE_APP_WEBSOCKET || 'true')
      }
    }
  }
})

