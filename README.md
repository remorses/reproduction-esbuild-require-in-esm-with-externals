Reproduction for https://github.com/evanw/esbuild/issues/566

After bundling `src/index.ts` with `yarn build`, `bundle/index.js` will contain require calls for `react`, even if format is set to `esm`