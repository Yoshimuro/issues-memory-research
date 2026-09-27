// Doc 346: captured param with default goes to the function's own context, "а не в отдельное окружение параметров, как требует спецификация".
// Spec (FunctionDeclarationInstantiation step 28): with parameter expressions, a SEPARATE environment is created for the body's var bindings.
function defCapOnly(x = 7){ return () => x; }
function defCapBody(x = 7){ var y = 1; return () => x + y; }
function simpleCapBody(x){ var y = 1; return () => x + y; }
defCapOnly()(); defCapBody()(); simpleCapBody(1)();
