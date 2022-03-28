/**
 * @type {import('vite').UserConfig}
 */
const config = {
  mode: 'production',
  server: {
    port: 8080,
  },
  build: {
    target: 'esnext',
    polyfillModulePreload: false,
    sourcemap: false,
    minify: false, // TODO: try minified
  },
  worker: {
    format: 'es',
  },
  plugins: [
    {
      name: 'configure-response-headers',
      configureServer: server => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          next();
        });
      },
    },
  ],
};

export default config;
