import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: fileURLToPath(new URL('./packages/vue/dist', import.meta.url)),
    lib: {
      entry: {
        index: fileURLToPath(new URL('./packages/vue/src/index.ts', import.meta.url)),
        AvenText: fileURLToPath(new URL('./packages/vue/src/AvenText.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
})
