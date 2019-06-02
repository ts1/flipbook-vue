import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import coffeescript from 'rollup-plugin-coffee-script'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import autoprefixer from 'autoprefixer'

export default {
  output: {
    name: 'flipbook'
  },
  plugins: [
    resolve({ extensions: ['.js', '.vue', '.coffee'] }),
    commonjs(),
    vue({
      needMap: false,
      style: { postcssPlugins: [autoprefixer()] },
      template: { isProduction: true }
    }),
    coffeescript(),
    buble()
  ]
}
