const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['entry-i18next-vue.js'],
  bundle: true,
  outfile: 'lib/i18next-vue.js',
  format: 'iife',
  plugins: [{
    name: 'globals',
    setup(build) {
      build.onResolve({ filter: /^vue$/ }, args => ({ path: 'vue', namespace: 'globals' }));
      build.onLoad({ filter: /^vue$/, namespace: 'globals' }, args => ({ contents: 'module.exports = window.Vue', loader: 'js' }));
      build.onResolve({ filter: /^i18next$/ }, args => ({ path: 'i18next', namespace: 'globals' }));
      build.onLoad({ filter: /^i18next$/, namespace: 'globals' }, args => ({ contents: 'module.exports = window.i18next', loader: 'js' }));
    },
  }],
}).then(() => {
    console.log('Build complete: lib/i18next-vue.js');
}).catch(() => process.exit(1));
