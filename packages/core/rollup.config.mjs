import terser from '@rollup/plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// modify the configuration so that rollup inlcudes rx code in the bundle

export default {
  input: 'src/index.js',
  plugins: [
    nodePolyfills(),
    commonjs(),
    nodeResolve({
      module: true,
      jsnext: true,
      main: true,
    }),
  ],
  output: [
    {
      file: 'dist/open-cells.js',
      // format: 'cjs'
      format: 'es',
    },
    {
      file: 'dist/open-cells.min.js',
      format: 'es',
      // name: 'version',
      plugins: [terser()],
    },
  ],
};
