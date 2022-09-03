import buble from '@rollup/plugin-buble'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import url from '@rollup/plugin-url'
import vue from 'rollup-plugin-vue'
import vue2 from 'rollup-plugin-vue2'
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

const plugins = (vue, minify = false) => {
  const plugins = [
    vue({
      needMap: false,
      template: { isProduction: true },
    }),
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
  if (minify) {
    plugins.push(terser({ output: { comments: /copyright|license/i } }))
  }
  return plugins
}

const modules = (vue, dist) => ({
  input: 'src/Flipbook.vue',
  external: ['rematrix', 'vue'],
  output: [
    { banner, format: 'es', file: `${dist}/flipbook.mjs` },
    { banner, format: 'cjs', file: `${dist}/flipbook.cjs.js`, exports: 'default' }
  ],
  plugins: plugins(vue),
})

const browser = (vue, dist, minify) => ({
  input: 'src/wrapper.coffee',
  external: ['vue'],
  output: {
    banner,
    format: 'iife',
    file: `${dist}/flipbook${minify ? '.min' : ''}.js`,
    globals: { vue: 'Vue'}
  },
  plugins: plugins(vue, minify),
})

export default [
  modules(vue, 'dist'),
  browser(vue, 'dist', false),
  browser(vue, 'dist', true),
  modules(vue2, 'dist/vue2'),
  browser(vue2, 'dist/vue2', false),
  browser(vue2, 'dist/vue2', true),
]
