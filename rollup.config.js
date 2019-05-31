import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import coffeescript from 'rollup-plugin-coffee-script'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  output: {
    name: 'flipbook'
  },
  plugins: [
    resolve({ extensions: ['.js', '.vue', '.coffee'] }),
    commonjs(),
    vue({ needMap: false }),
    coffeescript(),
    buble()
  ]
}
