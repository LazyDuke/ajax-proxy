const typescript = require('rollup-plugin-typescript2')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const { terser } = require('rollup-plugin-terser')
const json = require('rollup-plugin-json')
const merge = require('lodash.merge')
const cloneDeep = require('lodash.clonedeep')
const path = require('path')
const pkg = require('./package.json')

const minOutputs = [
  {
    file: pkg.main,
    format: 'cjs'
  },
  {
    file: pkg.module,
    format: 'es'
  },
  {
    name: 'ajaxProxy',
    file: pkg.browser,
    format: 'umd'
  }
]

const outputs = cloneDeep(minOutputs).map(output =>
  merge(output, { file: output.file.replace('.min', '') })
)

const common = {
  input: path.resolve(__dirname, './src/index.ts'),
  plugins: [
    resolve(),
    commonjs({
      include: /.\/node_modules/
    }),
    json(),
    typescript({
      typescript: require('typescript'),
      useTsconfigDeclarationDir: true,
      clean: true
    })
  ]
}

const minCommon = merge(cloneDeep(common), {
  plugins: common.plugins.concat(terser())
})

module.exports = minOutputs
  .map(minOutput => merge({ output: minOutput }, minCommon))
  .concat(outputs.map(output => merge({ output }, common)))
