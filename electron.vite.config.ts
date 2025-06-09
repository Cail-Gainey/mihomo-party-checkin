import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
// https://github.com/vdesjs/vite-plugin-monaco-editor/issues/21#issuecomment-1827562674
import monacoEditorPluginModule from 'vite-plugin-monaco-editor'
const isObjectWithDefaultFunction = (
  module: unknown
): module is { default: typeof monacoEditorPluginModule } =>
  module != null &&
  typeof module === 'object' &&
  'default' in module &&
  typeof module.default === 'function'
const monacoEditorPlugin = isObjectWithDefaultFunction(monacoEditorPluginModule)
  ? monacoEditorPluginModule.default
  : monacoEditorPluginModule

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          floating: resolve('src/renderer/floating.html')
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      },
      // 添加扩展名解析配置，确保在Linux上也能正确解析
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      // 启用保留符号链接选项，有助于解决大小写敏感问题
      preserveSymlinks: true
    },
    plugins: [
      react(),
      monacoEditorPlugin({
        languageWorkers: ['editorWorkerService', 'typescript', 'css'],
        customDistPath: (_, out) => `${out}/monacoeditorwork`,
        customWorkers: [
          {
            label: 'yaml',
            entry: 'monaco-yaml/yaml.worker'
          }
        ]
      })
    ],
    // 添加环境变量，禁用硬件加速
    define: {
      'process.env.DISABLE_GPU': JSON.stringify(true)
    }
  }
})
