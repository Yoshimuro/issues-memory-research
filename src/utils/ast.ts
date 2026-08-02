import type { Reference, Scope } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';

export function getCalleeName(callee: TSESTree.LeftHandSideExpression): string | null {
  if (callee.type === 'Identifier') {
    return callee.name;
  }
  if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
    return callee.property.name;
  }
  return null;
}

export function hasLocalDefinition(scope: Scope, name: string): boolean {
  let current: Scope | null = scope;
  while (current) {
    const variable = current.set.get(name);
    if (variable) {
      return variable.defs.length > 0;
    }
    current = current.upper;
  }
  return false;
}

export function isFetchCall(node: TSESTree.CallExpression, fetchNames: readonly string[], scope: Scope): boolean {
  const { callee } = node;
  if (callee.type === 'Identifier') {
    if (!fetchNames.includes(callee.name)) {
      return false;
    }
    // Skip local bindings (params, consts) that shadow global fetch / fetchNames.
    return !hasLocalDefinition(scope, callee.name);
  }
  if (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'globalThis' &&
    callee.property.type === 'Identifier' &&
    fetchNames.includes(callee.property.name)
  ) {
    return true;
  }
  return false;
}

export function unwrapAwait(node: TSESTree.Node): TSESTree.Node {
  if (node.type === 'AwaitExpression') {
    return node.argument;
  }
  return node;
}

export function isTextDecoderCallee(callee: TSESTree.Expression): boolean {
  if (callee.type === 'Identifier') {
    return callee.name === 'TextDecoder';
  }
  if (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'TextDecoder'
  ) {
    return true;
  }
  return false;
}

const ITERATOR_METHODS = new Set(['forEach', 'map', 'filter', 'reduce', 'some', 'every', 'find', 'flatMap']);

const LOOP_TYPES = new Set(['ForStatement', 'WhileStatement', 'DoWhileStatement', 'ForOfStatement', 'ForInStatement']);

export function isInsideLoop(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node.parent as TSESTree.Node | undefined;
  while (current) {
    if (LOOP_TYPES.has(current.type)) {
      return true;
    }
    current = current.parent as TSESTree.Node | undefined;
  }
  return false;
}

export function isInsideIteratorCallback(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node;
  while (current.parent) {
    current = current.parent;
    if (current.type === 'ArrowFunctionExpression' || current.type === 'FunctionExpression') {
      const fnParent = current.parent as TSESTree.Node | undefined;
      if (
        fnParent?.type === 'CallExpression' &&
        fnParent.callee.type === 'MemberExpression' &&
        !fnParent.callee.computed &&
        fnParent.callee.property.type === 'Identifier' &&
        ITERATOR_METHODS.has(fnParent.callee.property.name) &&
        fnParent.arguments.includes(current)
      ) {
        return true;
      }
    }
  }
  return false;
}

export function isInsideStreamDataHandler(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node;
  while (current.parent) {
    current = current.parent;
    if (current.type === 'ArrowFunctionExpression' || current.type === 'FunctionExpression') {
      const fnParent = current.parent as TSESTree.Node | undefined;
      if (
        fnParent?.type === 'CallExpression' &&
        fnParent.callee.type === 'MemberExpression' &&
        !fnParent.callee.computed &&
        fnParent.callee.property.type === 'Identifier' &&
        (fnParent.callee.property.name === 'on' ||
          fnParent.callee.property.name === 'addListener' ||
          fnParent.callee.property.name === 'once')
      ) {
        const eventArg = fnParent.arguments[0];
        if (
          eventArg &&
          ((eventArg.type === 'Literal' && eventArg.value === 'data') ||
            (eventArg.type === 'TemplateLiteral' &&
              eventArg.expressions.length === 0 &&
              eventArg.quasis[0]?.value.cooked === 'data')) &&
          fnParent.arguments.includes(current)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isInsideTimerCallback(node: TSESTree.Node, includeTimers: boolean): boolean {
  if (!includeTimers) {
    return false;
  }
  let current: TSESTree.Node | undefined = node;
  while (current.parent) {
    current = current.parent;
    if (current.type === 'ArrowFunctionExpression' || current.type === 'FunctionExpression') {
      const fnParent = current.parent as TSESTree.Node | undefined;
      if (
        fnParent?.type === 'CallExpression' &&
        fnParent.callee.type === 'Identifier' &&
        (fnParent.callee.name === 'setInterval' || fnParent.callee.name === 'setImmediate') &&
        fnParent.arguments[0] === current
      ) {
        return true;
      }
    }
  }
  return false;
}

export function isByteLengthQueuingStrategy(node: TSESTree.Node | null | undefined): boolean {
  if (!node) {
    return false;
  }
  if (node.type === 'NewExpression') {
    return isTextDecoderLikeCtor(node.callee, 'ByteLengthQueuingStrategy');
  }
  if (node.type === 'Identifier') {
    return true;
  }
  return false;
}

function isTextDecoderLikeCtor(callee: TSESTree.Expression | null, name: string): boolean {
  if (!callee) {
    return false;
  }
  if (callee.type === 'Identifier') {
    return callee.name === name;
  }
  if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
    return callee.property.name === name;
  }
  return false;
}

export function getObjectProperty(object: TSESTree.ObjectExpression, keyName: string): TSESTree.Property | undefined {
  return object.properties.find((prop) => {
    if (prop.type !== 'Property') {
      return false;
    }
    if (prop.key.type === 'Identifier' && prop.key.name === keyName) {
      return true;
    }
    if (prop.key.type === 'Literal' && prop.key.value === keyName) {
      return true;
    }
    return false;
  }) as TSESTree.Property | undefined;
}

const DEFAULT_STREAM_CREATORS = new Set([
  'createReadStream',
  'createWriteStream',
  'PassThrough',
  'Transform',
  'Readable',
  'Writable',
  'Duplex',
]);

export function isStreamCreationCall(
  node: TSESTree.CallExpression | TSESTree.NewExpression,
  streamCreators: readonly string[],
): boolean {
  const names = new Set([...DEFAULT_STREAM_CREATORS, ...streamCreators]);
  if (node.type === 'NewExpression') {
    if (!node.callee || node.callee.type === 'Super') {
      return false;
    }
    const name = getCalleeName(node.callee as TSESTree.LeftHandSideExpression);
    return name !== null && names.has(name);
  }
  if (node.callee.type === 'Super') {
    return false;
  }
  const name = getCalleeName(node.callee as TSESTree.LeftHandSideExpression);
  return name !== null && names.has(name);
}

export function isPipelineCall(node: TSESTree.CallExpression): boolean {
  if (node.callee.type === 'Super') {
    return false;
  }
  const name = getCalleeName(node.callee as TSESTree.LeftHandSideExpression);
  return name === 'pipeline';
}
