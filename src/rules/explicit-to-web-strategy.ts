import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { getObjectProperty } from '../utils/ast.js';
import { getBindingForIdentifier } from '../utils/scope.js';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/nodejs/node/issues/47128`,
);

type Options = [Record<string, never>];
type MessageIds = 'missingStrategy' | 'invalidStrategy';

function resolveStrategyNode(
  sourceCode: import('@typescript-eslint/utils').TSESLint.SourceCode,
  value: TSESTree.Expression | TSESTree.PrivateIdentifier,
): TSESTree.Node | null {
  if (value.type === 'PrivateIdentifier') {
    return null;
  }
  if (value.type === 'NewExpression') {
    return value;
  }
  if (value.type === 'Identifier') {
    const binding = getBindingForIdentifier(sourceCode, value);
    const def = binding?.defs[0];
    if (def?.node.type === 'VariableDeclarator' && def.node.init) {
      return def.node.init;
    }
  }
  return value;
}

export default createRule<Options, MessageIds>({
  name: 'explicit-to-web-strategy',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require ByteLengthQueuingStrategy when calling Readable.toWeb()',
    },
    fixable: 'code',
    schema: [{ type: 'object', additionalProperties: false }],
    messages: {
      missingStrategy:
        'Readable.toWeb() must pass `{ strategy: new ByteLengthQueuingStrategy({ highWaterMark }) }` to avoid queue memory blow-up.',
      invalidStrategy:
        'Readable.toWeb() strategy must be `new ByteLengthQueuingStrategy(...)`, not CountQueuingStrategy or another type.',
    },
  },
  defaultOptions: [{}],
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression' || node.callee.computed) {
          return;
        }
        if (node.callee.property.type !== 'Identifier' || node.callee.property.name !== 'toWeb') {
          return;
        }

        const optionsArg = node.arguments[1];
        if (!optionsArg) {
          context.report({
            node,
            messageId: 'missingStrategy',
            fix(fixer) {
              const streamArg = node.arguments[0];
              if (streamArg?.type === 'Identifier') {
                const name = streamArg.name;
                return fixer.insertTextAfter(
                  node.arguments[0]!,
                  `, { strategy: new ByteLengthQueuingStrategy({ highWaterMark: ${name}.readableHighWaterMark ?? 16384 }) }`,
                );
              }
              return null;
            },
          });
          return;
        }

        if (optionsArg.type !== 'ObjectExpression') {
          context.report({ node: optionsArg, messageId: 'missingStrategy' });
          return;
        }

        const strategyProp = getObjectProperty(optionsArg, 'strategy');
        if (!strategyProp) {
          context.report({ node: optionsArg, messageId: 'missingStrategy' });
          return;
        }
        if (strategyProp.type !== 'Property') {
          context.report({ node: optionsArg, messageId: 'missingStrategy' });
          return;
        }

        const resolved = resolveStrategyNode(
          context.sourceCode,
          strategyProp.value as TSESTree.Expression,
        );
        if (!resolved) {
          context.report({ node: strategyProp, messageId: 'invalidStrategy' });
          return;
        }

        if (resolved.type === 'NewExpression') {
          const ctor = resolved.callee;
          const ctorName = ctor.type === 'Identifier'
            ? ctor.name
            : ctor.type === 'MemberExpression' && ctor.property.type === 'Identifier'
              ? ctor.property.name
              : null;
          if (ctorName === 'ByteLengthQueuingStrategy') {
            return;
          }
          if (ctorName === 'CountQueuingStrategy') {
            context.report({ node: strategyProp, messageId: 'invalidStrategy' });
            return;
          }
        }

        if (resolved.type === 'Identifier') {
          const binding = getBindingForIdentifier(context.sourceCode, resolved);
          const def = binding?.defs[0];
          if (def?.node.type === 'VariableDeclarator' && def.node.init?.type === 'NewExpression') {
            const ctor = def.node.init.callee;
            const ctorName = ctor.type === 'Identifier'
              ? ctor.name
              : ctor.type === 'MemberExpression' && ctor.property.type === 'Identifier'
                ? ctor.property.name
                : null;
            if (ctorName === 'ByteLengthQueuingStrategy') {
              return;
            }
          }
          context.report({ node: strategyProp, messageId: 'invalidStrategy' });
          return;
        }

        context.report({ node: strategyProp, messageId: 'invalidStrategy' });
      },
    };
  },
});
