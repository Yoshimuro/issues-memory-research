import type { TSESTree } from '@typescript-eslint/utils';

const LOOP_TYPES = new Set([
  'ForStatement',
  'WhileStatement',
  'DoWhileStatement',
  'ForOfStatement',
  'ForInStatement',
]);

const FUNCTION_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

/** Nearest enclosing loop within the same function, if any. */
export function getEnclosingLoop(node: TSESTree.Node): TSESTree.Node | null {
  let current = node.parent;
  while (current) {
    if (FUNCTION_TYPES.has(current.type)) {
      return null;
    }
    if (LOOP_TYPES.has(current.type)) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

function ancestorChain(node: TSESTree.Node): TSESTree.Node[] {
  const chain: TSESTree.Node[] = [];
  let current: TSESTree.Node | undefined = node;
  while (current) {
    chain.push(current);
    current = current.parent;
  }
  return chain.reverse();
}

/**
 * Whether `a` and `b` sit on branches that never both execute, so neither can
 * observe the other's side effects.
 */
export function areMutuallyExclusive(a: TSESTree.Node, b: TSESTree.Node): boolean {
  const chainA = ancestorChain(a);
  const chainB = ancestorChain(b);
  let i = 0;
  while (i < chainA.length && i < chainB.length && chainA[i] === chainB[i]) {
    i++;
  }
  const parent = chainA[i - 1];
  const branchA = chainA[i];
  const branchB = chainB[i];
  if (!parent || !branchA || !branchB) {
    return false;
  }
  if (parent.type === 'IfStatement' || parent.type === 'ConditionalExpression') {
    return (
      (branchA === parent.consequent && branchB === parent.alternate) ||
      (branchA === parent.alternate && branchB === parent.consequent)
    );
  }
  if (parent.type === 'TryStatement') {
    // catch runs only when the try block threw; finally always runs.
    return (
      (branchA === parent.block && branchB === parent.handler) ||
      (branchA === parent.handler && branchB === parent.block)
    );
  }
  if (parent.type === 'SwitchStatement') {
    // Fallthrough can link cases, so treat them as exclusive only to avoid
    // cutting a window we cannot prove is dead.
    return branchA.type === 'SwitchCase' && branchB.type === 'SwitchCase' && branchA !== branchB;
  }
  return false;
}
