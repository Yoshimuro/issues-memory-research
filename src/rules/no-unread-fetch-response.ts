import type { Reference, Scope } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils, ESLintUtils } from '@typescript-eslint/utils';
import { isFetchCall, unwrapAwait } from '../utils/ast.js';
import { areMutuallyExclusive } from '../utils/flow.js';

const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/nodejs/node/issues?q=${name}`);

const DEFAULT_CONSUME = ['text', 'json', 'arrayBuffer', 'blob', 'formData'] as const;

type Options = [
  {
    fetchNames?: string[];
    allowReturnResponse?: boolean;
    additionalConsumeMethods?: string[];
  },
];

type MessageIds = 'unreadFetchResponse' | 'overwrittenFetchResponse';

function getConsumeMethods(options: Options[0]): Set<string> {
  return new Set([...DEFAULT_CONSUME, ...(options.additionalConsumeMethods ?? [])]);
}

function isFetchAwait(node: TSESTree.Node, fetchNames: readonly string[], scope: Scope): boolean {
  const inner = unwrapAwait(node);
  return inner.type === 'CallExpression' && isFetchCall(inner, fetchNames, scope) && !isBodylessRequest(inner);
}

function getStaticKeyName(key: TSESTree.Node): string | null {
  if (key.type === 'Identifier') {
    return key.name;
  }
  if (key.type === 'Literal' && typeof key.value === 'string') {
    return key.value;
  }
  return null;
}

/**
 * Responses to HEAD requests never carry a body, so there is nothing to consume or cancel.
 */
function isBodylessRequest(node: TSESTree.CallExpression): boolean {
  const init = node.arguments[1];
  if (init?.type !== 'ObjectExpression') {
    return false;
  }
  return init.properties.some((property) => {
    if (property.type !== 'Property' || property.computed) {
      return false;
    }
    return (
      getStaticKeyName(property.key) === 'method' &&
      property.value.type === 'Literal' &&
      typeof property.value.value === 'string' &&
      property.value.value.toUpperCase() === 'HEAD'
    );
  });
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

/**
 * The next write that overwrites this response, dropping the reference to it.
 * Writes on a sibling branch are skipped: they never run on the same path.
 */
function findOverwrite(references: Reference[], self: Reference, from: number): Reference | null {
  let nearest: Reference | null = null;
  for (const ref of references) {
    if (ref === self || !ref.isWrite() || ref.identifier.range[0] < from) {
      continue;
    }
    if (areMutuallyExclusive(ref.identifier, self.identifier)) {
      continue;
    }
    if (!nearest || ref.identifier.range[0] < nearest.identifier.range[0]) {
      nearest = ref;
    }
  }
  return nearest;
}

/**
 * References that can consume the response produced by `self`: those between
 * this write and the next overwrite of the same binding.
 *
 * Known gap: a write inside a loop produces one response per iteration, but a
 * single consumer after the loop covers only the last one. Source order cannot
 * express that; catching it needs a real control-flow graph.
 */
function getLiveReferences(
  references: Reference[],
  self: Reference,
  awaitNode: TSESTree.Node,
): { live: Reference[]; overwrittenBy: Reference | null } {
  const from = awaitNode.range[1];
  const overwrittenBy = findOverwrite(references, self, from);
  const until = overwrittenBy ? overwrittenBy.identifier.range[0] : Number.POSITIVE_INFINITY;
  const live = references.filter((ref) => ref.identifier.range[0] >= from && ref.identifier.range[0] < until);
  return { live, overwrittenBy };
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
      overwrittenFetchResponse:
        'fetch() response body was not consumed before `{{name}}` was reassigned. Consume it or call .body.cancel() before the reassignment.',
    },
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const fetchNames = options.fetchNames ?? ['fetch'];
    const allowReturnResponse = options.allowReturnResponse ?? false;
    const consumeMethods = getConsumeMethods(options);
    const pending: { node: TSESTree.Node; binding: TSESTree.Identifier | null }[] = [];

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
          pending.push({ node, binding: parent.id });
          return;
        }
        if (parent.type === 'AssignmentExpression' && parent.operator === '=' && parent.left.type === 'Identifier') {
          pending.push({ node, binding: parent.left });
          return;
        }
        if (parent.type === 'ReturnStatement') {
          if (!allowReturnResponse) {
            pending.push({ node, binding: null });
          }
          return;
        }
        if (parent.type === 'ExpressionStatement') {
          pending.push({ node, binding: null });
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
        for (const item of pending) {
          if (item.binding === null) {
            context.report({ node: item.node, messageId: 'unreadFetchResponse' });
            continue;
          }
          // The assignment may sit in a nested block — walk up to the declaring scope.
          const variable = ASTUtils.findVariable(context.sourceCode.getScope(item.binding), item.binding);
          const self = variable?.references.find((ref) => ref.identifier === item.binding);
          // Unresolvable binding: assume a leak rather than stay silent.
          if (!variable || !self) {
            context.report({ node: item.node, messageId: 'unreadFetchResponse' });
            continue;
          }
          const { live, overwrittenBy } = getLiveReferences(variable.references, self, item.node);
          if (isBodyConsumed(live, consumeMethods, allowReturnResponse)) {
            continue;
          }
          context.report(
            overwrittenBy
              ? {
                  node: item.node,
                  messageId: 'overwrittenFetchResponse',
                  data: { name: item.binding.name },
                }
              : { node: item.node, messageId: 'unreadFetchResponse' },
          );
        }
      },
    };
  },
});
