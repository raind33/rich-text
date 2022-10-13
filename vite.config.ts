import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve('src')
    }
  },
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'haluo-biz',
      fileName: 'haluo-biz',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue', 'vuedraggable', '@haluo/util'],
      output: {
        globals: {
          vue: 'Vue',
          '@haluo/util': 'hUtil',
          vuedraggable: 'vuedraggable'
        }
      }
    }
  },
  plugins: [createVuePlugin()]
})
