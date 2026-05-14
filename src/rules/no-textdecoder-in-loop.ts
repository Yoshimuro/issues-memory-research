import { ESLintUtils } from '@typescript-eslint/utils';
import {
  isInsideIteratorCallback,
  isInsideLoop,
  isInsideStreamDataHandler,
  isInsideTimerCallback,
  isTextDecoderCallee,
} from '../utils/ast.js';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/nodejs/node/issues/32424`,
);

type Options = [{
  includeTimers?: boolean;
  allowInsideNamedFunctions?: string[];
}];

type MessageIds = 'textDecoderInLoop';

function isInsideNamedAllowedFunction(
  node: { parent?: unknown },
  allowed: readonly string[],
): boolean {
  let current = node.parent as { type?: string; id?: { type?: string; name?: string }; parent?: unknown } | undefined;
  while (current) {
    if (
      (current.type === 'FunctionDeclaration' || current.type === 'FunctionExpression')
      && current.id?.type === 'Identifier'
      && current.id.name
      && allowed.includes(current.id.name)
    ) {
      return true;
    }
    current = current.parent as typeof current;
  }
  return false;
}

export default createRule<Options, MessageIds>({
  name: 'no-textdecoder-in-loop',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow creating new TextDecoder instances inside hot paths',
    },
    schema: [
      {
        type: 'object',
        properties: {
          includeTimers: { type: 'boolean' },
          allowInsideNamedFunctions: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      textDecoderInLoop:
        'Avoid `new TextDecoder()` in a hot path. Hoist a single decoder outside the loop or callback.',
    },
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const includeTimers = options.includeTimers ?? false;
    const allowedFunctions = options.allowInsideNamedFunctions ?? [];

    return {
      NewExpression(node) {
        if (!isTextDecoderCallee(node.callee)) {
          return;
        }
        const inHotPath = isInsideLoop(node)
          || isInsideIteratorCallback(node)
          || isInsideStreamDataHandler(node)
          || isInsideTimerCallback(node, includeTimers);
        if (!inHotPath) {
          return;
        }
        if (isInsideNamedAllowedFunction(node, allowedFunctions)) {
          return;
        }
        context.report({ node, messageId: 'textDecoderInLoop' });
      },
    };
  },
});
