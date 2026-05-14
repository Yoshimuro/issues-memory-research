import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

type Scope = ReturnType<TSESLint.SourceCode['getScope']>;
type Reference = NonNullable<Scope['references'][number]>;

export function getBindingForIdentifier(
  sourceCode: TSESLint.SourceCode,
  identifier: TSESTree.Identifier,
): Reference['resolved'] | null {
  const scope = sourceCode.getScope(identifier);
  const reference = scope.references.find((ref) => ref.identifier === identifier);
  return reference?.resolved ?? null;
}

export function bindingHasDestroyCall(
  sourceCode: TSESLint.SourceCode,
  binding: NonNullable<Reference['resolved']>,
): boolean {
  for (const ref of binding.references) {
    const { parent } = ref.identifier;
    if (
      parent?.type === 'MemberExpression'
      && !parent.computed
      && parent.property.type === 'Identifier'
      && parent.property.name === 'destroy'
      && parent.parent?.type === 'CallExpression'
      && parent.parent.callee === parent
    ) {
      return true;
    }
  }
  return false;
}

export function bindingUsedInPipeline(
  sourceCode: TSESLint.SourceCode,
  binding: NonNullable<Reference['resolved']>,
): boolean {
  for (const ref of binding.references) {
    const { parent } = ref.identifier;
    if (parent?.type === 'CallExpression') {
      const calleeName = parent.callee.type === 'Identifier' ? parent.callee.name : null;
      if (calleeName === 'pipeline' && parent.arguments.some((arg) => containsIdentifier(arg, ref.identifier.name))) {
        return true;
      }
    }
  }
  return false;
}

function containsIdentifier(node: TSESTree.Node, name: string): boolean {
  if (node.type === 'Identifier' && node.name === name) {
    return true;
  }
  for (const key of Object.keys(node)) {
    const value = (node as unknown as Record<string, unknown>)[key];
    if (!value || typeof value !== 'object') {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && 'type' in item && containsIdentifier(item as TSESTree.Node, name)) {
          return true;
        }
      }
    } else if ('type' in value && containsIdentifier(value as TSESTree.Node, name)) {
      return true;
    }
  }
  return false;
}
