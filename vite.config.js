/**
 * @type {import('vite').UserConfig}
 */
const config = {
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
};

export default config;
