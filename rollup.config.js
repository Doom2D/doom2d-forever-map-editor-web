import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { babel } from '@rollup/plugin-babel'
import { terser } from "rollup-terser"
import { wasm } from '@rollup/plugin-wasm'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    name: 'MapEditor'
  },
  external: ['path', 'fs'],
  plugins: [commonjs(), resolve({
    browser: true,
    extensions: ['.ts', '.js', '.mjs'],
  }), babel({
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs'],
    exclude: 'node_modules/**',
    presets: [
      [
        '@babel/preset-env',
        {
          corejs: 3,
          modules: false,
          useBuiltIns: 'usage'
        }
      ]
    ]
  }), typescript(), wasm()],
  external: [/@babel\/runtime/],
  treeshake: true,
}