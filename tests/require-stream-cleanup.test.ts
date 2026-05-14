import { RuleTester } from '@typescript-eslint/rule-tester';
import parser from '@typescript-eslint/parser';
import rule from '../dist/rules/require-stream-cleanup.js';

RuleTester.afterAll = () => {};
RuleTester.it = (name, fn) => fn();
RuleTester.itOnly = RuleTester.it;
RuleTester.describe = (_, fn) => fn();

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

ruleTester.run('require-stream-cleanup', rule, {
  valid: [
    'import { pipeline } from "node:stream/promises"; async function ok() { const src = createReadStream(p); await pipeline(src, dst); }',
    'function ok() { const s = createReadStream(p); try { s.on("data", () => {}); } finally { s.destroy(); } }',
    'function ok() { const s = createReadStream(p); s.destroy(); }',
    'function ok() { console.log("noop"); }',
    {
      code: 'function ok() { const s = createReadStream(p); s.pipe(dst); }',
      options: [{ checkPipe: false, checkDestroy: false }],
    },
    {
      code: 'function ok() { const s = createReadStream(p); s.on("data", () => {}); }',
      options: [{ checkDestroy: false }],
    },
  ],
  invalid: [
    {
      code: 'function bad() { const src = createReadStream(p); src.pipe(dst); }',
      errors: [{ messageId: 'requireExplicitDestroy' }, { messageId: 'preferPipelineOverPipe' }],
    },
    {
      code: 'function bad() { createReadStream(p).pipe(dst); }',
      errors: [{ messageId: 'preferPipelineOverPipe' }],
    },
    {
      code: 'function bad() { const s = createReadStream(p); s.on("data", () => {}); }',
      errors: [{ messageId: 'requireExplicitDestroy' }],
    },
    {
      code: 'function bad() { const s = new PassThrough(); s.write("x"); }',
      errors: [{ messageId: 'requireExplicitDestroy' }],
    },
  ],
});

console.log('require-stream-cleanup: ok');
