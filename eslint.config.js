import plugin from './dist/index.js';

export default [
  {
    files: ['**/*.{js,ts}', 'fixtures/**/*.js'],
    plugins: {
      'node-memory': plugin,
    },
    rules: {
      'node-memory/no-unread-fetch-response': 'error',
      'node-memory/no-textdecoder-in-loop': 'warn',
      'node-memory/explicit-to-web-strategy': 'error',
      'node-memory/require-stream-cleanup': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'tests/**', 'src/**'],
  },
];
