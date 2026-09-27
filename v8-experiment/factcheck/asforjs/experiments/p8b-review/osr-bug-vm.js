// запускает osr-bug.js как классический скрипт (глобальная область), а не CJS-модуль
const vm = require('vm'); const fs = require('fs');
globalThis.process = process;
vm.runInThisContext(fs.readFileSync(__dirname + '/osr-bug.js', 'utf8'), { filename: 'osr-bug.js' });
