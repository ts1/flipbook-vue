import buble from '@rollup/plugin-buble'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import url from '@rollup/plugin-url'
import vue from 'rollup-plugin-vue'
import coffeescript from 'rollup-plugin-coffee-script'
import { terser } from 'rollup-plugin-terser'
import autoprefixer from 'autoprefixer'
import { name, version } from './package.json'
import styles from 'rollup-plugin-styles'

const banner = `/*!
 * @license
 * ${name} v${version}
 * Copyright © ${new Date().getFullYear()} Takeshi Sone.
 * Released under the MIT License.
 */
`

const plugins = [
  vue(),
  styles({
    plugins: [autoprefixer()],
    minimize: true,
  }),
  resolve({ extensions: ['.js', '.vue', '.coffee'] }),
  commonjs(),
  coffeescript(),
  buble(),
  url(),
]

const module = {
  input: 'src/Flipbook.vue',
  external: ['rematrix', 'vue'],
  output: [
    { banner, format: 'es', file: 'dist/flipbook.es.js' },
    { banner, format: 'cjs', file: 'dist/flipbook.cjs.js' }
  ],
  plugins,
}

const browser = {
  input: 'src/v3wrapper.coffee',
  external: ['vue'],
  output: {
    banner,
    format: 'iife',
    file: 'dist/flipbook.js',
    globals: { vue: 'Vue'}
  },
  plugins,
}

const browserMin = {
  ...browser,
  output: {
    ...browser.output,
    file: 'dist/flipbook.min.js',
  },
  plugins: [
    ...browser.plugins,
    terser({ output: { comments: /copyright|license/i } }),
  ],
}

export default [module, browser, browserMin]
