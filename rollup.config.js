import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',  // Input TypeScript file
  output: [
    {
      file: 'dist/bundle.js',  // Output JavaScript file
      format: 'esm',            // Output format as ES module
      sourcemap: true,          // Enable sourcemaps for debugging
    },
    {
      file: 'dist/bundle.d.ts',  // Output type definitions
      format: 'esm',             // Output format for the declarations
      sourcemap: true,           // Enable sourcemaps for debugging declarations
    },
  ],
  plugins: [
    resolve(),                  // Resolves third-party modules in node_modules
    commonjs(),                 // Converts CommonJS modules to ES6
    typescript({ 
      tsconfig: './tsconfig.json', // Use TypeScript plugin and config
      sourceMap: true,            // Enable source map for better debugging
    }),
    terser(),                   // Minifies the output
  ],
};
