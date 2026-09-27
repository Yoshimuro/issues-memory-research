function neverCalled() { return 1; let a = 1; var a = 2; }
(typeof print === 'function' ? print : console.log)("var/let conflict: loaded OK");
