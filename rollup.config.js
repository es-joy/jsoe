import builtins from 'rollup-plugin-node-builtins';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import babel from 'rollup-plugin-babel';
import terser from '@rollup/plugin-terser';
import istanbul from 'rollup-plugin-istanbul';

export default [{
  input: 'src/index.js',
  output: {
    sourcemap: true,
    file: 'dist/index.js',
    format: 'es'
  },
  plugins: [
    terser({
      /* eslint-disable camelcase -- API */
      // Needed for Typeson's `Undefined` and other constructor detection
      keep_fnames: true,
      keep_classnames: true // Keep in case implementing above as classes
      /* eslint-enable camelcase -- API */
    }),
    nodeResolve(),
    commonjs()
  ]
}, {
  input: 'demo/index-instrumented.js',
  output: {
    file: 'instrumented/demo/index.js',
    format: 'es'
  },
  plugins: [
    istanbul(),
    nodeResolve(),
    commonjs()
  ]
}, {
  input: 'demo/index-schema.js',
  output: {
    file: 'instrumented/demo/index-schema.js',
    format: 'es'
  },
  plugins: [
    istanbul(),
    nodeResolve(),
    commonjs()
  ]
}, {
  input: 'demo/schema-preloaded.js',
  output: {
    file: 'instrumented/demo/schema-preloaded.js',
    format: 'es'
  },
  plugins: [
    istanbul(),
    nodeResolve(),
    commonjs()
  ]
}, {
  input: 'demo/schema-preloaded-array.js',
  output: {
    file: 'instrumented/demo/schema-preloaded-array.js',
    format: 'es'
  },
  plugins: [
    istanbul(),
    nodeResolve(),
    commonjs()
  ]
}, {
  input: 'demo/index-arbitraryJS.js',
  output: {
    file: 'instrumented/demo/index-arbitraryJS.js',
    format: 'es'
  },
  plugins: [
    istanbul(),
    nodeResolve(),
    commonjs()
  ]
}, {
  input: 'node_modules/fast-deep-equal/es6/index.js',
  output: {
    file: 'src/deepEqual.js',
    format: 'es',
    sourcemap: true,
    name: 'deepEqual'
  },
  plugins: [
    /*
      babel(),
      terser({
          // Needed for Typeson's `Undefined` and other constructor detection
          keep_fnames: true,
          keep_classnames: true // Keep in case implementing above as classes
      }),
      */
    builtins(),
    nodeResolve(),
    commonjs({
      include: 'node_modules/**'
    })
  ]
}];
