// var redeclaration is allowed; var vs let conflict is an early error
function neverCalled() { return 1; var a = 1; var a = 2; }
(typeof print === 'function' ? print : console.log)("var redeclaration: loaded OK");
