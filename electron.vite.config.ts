import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { loadEnv } from 'vite'
import createPlugins from './vite/plugins'

export default defineConfig(({ command, mode }) => {
  // 加载 Electron 环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    main: {
      entry: 'src/main/index.ts',
      vite: {
        build: {
          outDir: 'dist/main',
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
      entry: 'src/preload/index.ts',
      vite: {
        build: {
          outDir: 'dist/preload'
        }
      }
    },
    renderer: {
      root: '.',
      entry: 'index.html',
      build: {
        outDir: 'dist/renderer',
        rollupOptions: {
          input: 'index.html',
          external: ['uno.css']
        }
      },
      plugins: createPlugins(env, command === 'build'),
      resolve: {
        alias: {
          '~': path.resolve(__dirname, './'),
          '@': path.resolve(__dirname, './src'),
          'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
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

