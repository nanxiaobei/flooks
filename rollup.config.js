import babel from 'rollup-plugin-babel';
import dts from 'rollup-plugin-dts';
import { main, module, types } from './package.json';

const input = 'src/index.ts';
const external = (id) => id === 'react' || id.includes('@babel/runtime');
const plugins = (useESModules) => [
  babel({
    extensions: ['.ts'],
    plugins: [['@babel/plugin-transform-runtime', { useESModules }]],
    runtimeHelpers: true,
  }),
];

export default [
  { input, output: { file: main, format: 'cjs' }, external, plugins: plugins(false) },
  { input, output: { file: module, format: 'es' }, external, plugins: plugins(true) },
  { input, output: { file: types, format: 'es' }, plugins: [dts()] },
];
