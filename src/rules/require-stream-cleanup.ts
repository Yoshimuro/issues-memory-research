import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { isPipelineCall, isStreamCreationCall } from '../utils/ast.js';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/nodejs/node/issues/50762`,
);

type Options = [{
  checkPipe?: boolean;
  checkDestroy?: boolean;
  streamCreators?: string[];
}];

type MessageIds = 'preferPipelineOverPipe' | 'requireExplicitDestroy';

type StreamBinding = {
  node: TSESTree.Node;
  name: string;
};

function referenceIsCleaned(identifier: TSESTree.Identifier): boolean {
  const { parent } = identifier;
  if (parent?.type === 'CallExpression') {
    if (isPipelineCall(parent)) {
      return true;
    }
  }
  if (
    parent?.type === 'MemberExpression'
    && !parent.computed
    && parent.property.type === 'Identifier'
    && parent.property.name === 'destroy'
    && parent.parent?.type === 'CallExpression'
  ) {
    return true;
  }
  return false;
}

function findVariable(
  sourceCode: import('@typescript-eslint/utils').TSESLint.SourceCode,
  name: string,
  fromNode: TSESTree.Node,
) {
  let scope: ReturnType<typeof sourceCode.getScope> | null = sourceCode.getScope(fromNode);
  while (scope) {
    const variable = scope.set.get(name);
    if (variable) {
      return variable;
    }
    scope = scope.upper;
  }
  return null;
}

export default createRule<Options, MessageIds>({
  name: 'require-stream-cleanup',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer pipeline() over pipe() and require explicit stream.destroy() cleanup',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checkPipe: { type: 'boolean' },
          checkDestroy: { type: 'boolean' },
          streamCreators: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferPipelineOverPipe:
        'Prefer `pipeline()` from `node:stream/promises` over `.pipe()` for automatic teardown on error.',
      requireExplicitDestroy:
        'Stream created without explicit `.destroy()` or `pipeline()` cleanup. Add destroy in finally/error handler.',
    },
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const checkPipe = options.checkPipe ?? true;
    const checkDestroy = options.checkDestroy ?? true;
    const streamCreators = options.streamCreators ?? [];
    const streamBindings: StreamBinding[] = [];

    function isStreamLikeReceiver(node: TSESTree.MemberExpression): boolean {
      if (node.object.type === 'Identifier') {
        const objectName = node.object.name;
        return streamBindings.some((b) => b.name === objectName);
      }
      if (node.object.type === 'CallExpression' && isStreamCreationCall(node.object, streamCreators)) {
        return true;
      }
      return false;
    }

    return {
      VariableDeclarator(node) {
        if (!checkDestroy || node.id.type !== 'Identifier' || !node.init) {
          return;
        }
        const init = node.init;
        if (
          (init.type === 'CallExpression' || init.type === 'NewExpression')
          && isStreamCreationCall(init, streamCreators)
        ) {
          streamBindings.push({ node: init, name: node.id.name });
        }
      },

      CallExpression(node) {
        if (checkPipe && node.callee.type === 'MemberExpression') {
          const member = node.callee;
          if (
            !member.computed
            && member.property.type === 'Identifier'
            && member.property.name === 'pipe'
            && isStreamLikeReceiver(member)
          ) {
            context.report({ node: member.property, messageId: 'preferPipelineOverPipe' });
          }
        }
      },

      'Program:exit'() {
        if (!checkDestroy) {
          return;
        }
        for (const binding of streamBindings) {
          const variable = findVariable(context.sourceCode, binding.name, binding.node);
          if (!variable) {
            context.report({ node: binding.node, messageId: 'requireExplicitDestroy' });
            continue;
          }
          const cleaned = variable.references.some((ref) => {
            if (ref.identifier.type !== 'Identifier') {
              return false;
            }
            return referenceIsCleaned(ref.identifier);
          });
          if (!cleaned) {
            context.report({ node: binding.node, messageId: 'requireExplicitDestroy' });
          }
        }
      },
    };
  },
});
