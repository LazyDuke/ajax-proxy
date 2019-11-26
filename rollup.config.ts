import cloneDeep from 'lodash.clonedeep'
import merge from 'lodash.merge'
import path from 'path'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import typescript2 from 'rollup-plugin-typescript2'
import typescript from 'typescript'

import pkg from './package.json'

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
    file: './dist/index.min.js',
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
    typescript2({
      typescript,
      useTsconfigDeclarationDir: true,
      clean: true
    })
  ]
}

const minCommon = merge(cloneDeep(common), {
  plugins: common.plugins.slice(0, common.plugins.length - 1).concat(
    typescript2({
      typescript,
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          removeComments: true
        }
      },
      clean: true
    }),
    terser()
  )
})

module.exports = minOutputs
  .map(minOutput => merge({ output: minOutput }, minCommon))
  .concat(outputs.map(output => merge({ output }, common)))
