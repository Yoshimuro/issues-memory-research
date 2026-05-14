import type { TSESLint } from '@typescript-eslint/utils';
import noUnreadFetchResponse from './rules/no-unread-fetch-response.js';
import noTextDecoderInLoop from './rules/no-textdecoder-in-loop.js';
import explicitToWebStrategy from './rules/explicit-to-web-strategy.js';
import requireStreamCleanup from './rules/require-stream-cleanup.js';

const plugin: TSESLint.FlatConfig.Plugin = {
  meta: {
    name: 'eslint-plugin-node-memory',
    version: '0.1.0',
  },
  rules: {
    'no-unread-fetch-response': noUnreadFetchResponse,
    'no-textdecoder-in-loop': noTextDecoderInLoop,
    'explicit-to-web-strategy': explicitToWebStrategy,
    'require-stream-cleanup': requireStreamCleanup,
  },
  configs: {
    recommended: {
      plugins: {
        'node-memory': {} as TSESLint.FlatConfig.Plugin,
      },
      rules: {
        'node-memory/no-unread-fetch-response': 'error',
        'node-memory/no-textdecoder-in-loop': 'warn',
        'node-memory/explicit-to-web-strategy': 'error',
        'node-memory/require-stream-cleanup': 'warn',
      },
    },
  },
};

(plugin.configs!.recommended as { plugins: Record<string, TSESLint.FlatConfig.Plugin> }).plugins['node-memory'] = plugin;

export default plugin;
export {
  noUnreadFetchResponse,
  noTextDecoderInLoop,
  explicitToWebStrategy,
  requireStreamCleanup,
};
