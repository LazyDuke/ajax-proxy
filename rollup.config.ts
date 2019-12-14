import path from 'path'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import typescript2 from 'rollup-plugin-typescript2'
import typescript from 'typescript'

import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'

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

const outputs = minOutputs.map(minOutput => ({
  ...minOutput,
  file: minOutput.file.replace('.min', '')
}))

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

const minCommon = {
  ...common,
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
}

export default minOutputs
  .map(minOutput => ({
    output: minOutput,
    ...minCommon
  }))
  .concat(
    outputs.map(output => ({
      output,
      ...common
    }))
  )
