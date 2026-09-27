const vm = require('vm'); const fs = require('fs'); globalThis.print = console.log;
vm.runInThisContext(fs.readFileSync(process.argv[2], 'utf8'));
