const log = typeof console !== 'undefined' ? console.log : print;
log('NoElementsProtector intact before:', %NoElementsProtector());
Object.prototype['0'] = 'x';   // or Array.prototype[3] = ...
log('after Object.prototype[0] = ...:', %NoElementsProtector());
