import type { Reference, Scope } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';
import { isFetchCall, unwrapAwait } from '../utils/ast.js';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/nodejs/node/issues?q=${name}`);

const DEFAULT_CONSUME = ['text', 'json', 'arrayBuffer', 'blob', 'formData'] as const;

type Options = [
  {
    fetchNames?: string[];
    allowReturnResponse?: boolean;
    additionalConsumeMethods?: string[];
  },
];

type MessageIds = 'unreadFetchResponse';

function getConsumeMethods(options: Options[0]): Set<string> {
  return new Set([...DEFAULT_CONSUME, ...(options.additionalConsumeMethods ?? [])]);
}

function isFetchAwait(node: TSESTree.Node, fetchNames: readonly string[], scope: Scope): boolean {
  const inner = unwrapAwait(node);
  return inner.type === 'CallExpression' && isFetchCall(inner, fetchNames, scope);
}

function memberConsumesBody(member: TSESTree.MemberExpression, consumeMethods: Set<string>): boolean {
  if (member.computed || member.property.type !== 'Identifier') {
    return false;
  }
  const prop = member.property.name;
  if (consumeMethods.has(prop)) {
    return true;
  }
  if (prop === 'body') {
    const parent = member.parent;
    if (
      parent?.type === 'MemberExpression' &&
      !parent.computed &&
      parent.property.type === 'Identifier' &&
      (parent.property.name === 'cancel' || parent.property.name === 'getReader')
    ) {
      return true;
    }
  }
  return false;
}

function referenceConsumesBody(identifier: TSESTree.Identifier, consumeMethods: Set<string>): boolean {
  const { parent } = identifier;
  if (!parent) {
    return false;
  }
  if (parent.type === 'MemberExpression' && parent.object === identifier) {
    return memberConsumesBody(parent, consumeMethods);
  }
  if (
    parent.type === 'CallExpression' &&
    parent.callee.type === 'MemberExpression' &&
    parent.callee.object === identifier &&
    memberConsumesBody(parent.callee, consumeMethods)
  ) {
    return true;
  }
  return false;
}

function isBodyConsumed(references: Reference[], consumeMethods: Set<string>, allowReturnResponse: boolean): boolean {
  for (const ref of references) {
    if (ref.identifier.type !== 'Identifier') {
      continue;
    }
    if (referenceConsumesBody(ref.identifier, consumeMethods)) {
      return true;
    }
    if (allowReturnResponse && ref.identifier.parent?.type === 'ReturnStatement') {
      return true;
    }
  }
  return false;
}

export default createRule<Options, MessageIds>({
  name: 'no-unread-fetch-response',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require consuming or cancelling fetch() response bodies to avoid retained buffers',
    },
    schema: [
      {
        type: 'object',
        properties: {
          fetchNames: { type: 'array', items: { type: 'string' } },
          allowReturnResponse: { type: 'boolean' },
          additionalConsumeMethods: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unreadFetchResponse:
        'fetch() response body was not consumed. Call .text(), .json(), .arrayBuffer(), .blob(), .formData(), or .body.cancel().',
    },
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const fetchNames = options.fetchNames ?? ['fetch'];
    const allowReturnResponse = options.allowReturnResponse ?? false;
    const consumeMethods = getConsumeMethods(options);
    const pending: { node: TSESTree.Node; bindingName: string | null }[] = [];

    return {
      AwaitExpression(node) {
        if (!isFetchAwait(node, fetchNames, context.sourceCode.getScope(node))) {
          return;
        }
        const parent = node.parent;
        if (!parent) {
          return;
        }
        if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
          pending.push({ node, bindingName: parent.id.name });
          return;
        }
        if (parent.type === 'AssignmentExpression' && parent.operator === '=' && parent.left.type === 'Identifier') {
          pending.push({ node, bindingName: parent.left.name });
          return;
        }
        if (parent.type === 'ReturnStatement') {
          if (!allowReturnResponse) {
            pending.push({ node, bindingName: null });
          }
          return;
        }
        if (parent.type === 'ExpressionStatement') {
          pending.push({ node, bindingName: null });
        }
      },

      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'CallExpression' &&
          isFetchCall(callee.object, fetchNames, context.sourceCode.getScope(node)) &&
          callee.property.type === 'Identifier' &&
          consumeMethods.has(callee.property.name)
        ) {
          const idx = pending.findIndex((p) => p.node === callee.object);
          if (idx !== -1) {
            pending.splice(idx, 1);
          }
        }
      },

      'Program:exit'() {
        for (const item of [...pending]) {
          if (item.bindingName === null) {
            context.report({ node: item.node, messageId: 'unreadFetchResponse' });
            continue;
          }
          const scope = context.sourceCode.getScope(item.node);
          const variable = scope.variables.find((v) => v.name === item.bindingName) ?? scope.set.get(item.bindingName);
          if (!variable) {
            context.report({ node: item.node, messageId: 'unreadFetchResponse' });
            continue;
          }
          const consumed = isBodyConsumed(variable.references, consumeMethods, allowReturnResponse);
          if (!consumed) {
            context.report({ node: item.node, messageId: 'unreadFetchResponse' });
          }
        }
      },
    };
  },
});
