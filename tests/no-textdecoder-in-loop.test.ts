import { RuleTester } from '@typescript-eslint/rule-tester';
import parser from '@typescript-eslint/parser';
import rule from '../dist/rules/no-textdecoder-in-loop.js';

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

ruleTester.run('no-textdecoder-in-loop', rule, {
  valid: [
    'const d = new TextDecoder(); for (const x of xs) { d.decode(x); }',
    'function ok() { return new TextDecoder(); }',
    'const d = new util.TextDecoder(); arr.forEach(x => d.decode(x));',
  ],
  invalid: [
    {
      code: 'for (const x of xs) { new TextDecoder().decode(x); }',
      errors: [{ messageId: 'textDecoderInLoop' }],
    },
    {
      code: 'while (true) { new TextDecoder().decode(buf); }',
      errors: [{ messageId: 'textDecoderInLoop' }],
    },
    {
      code: 'items.map(x => new TextDecoder().decode(x))',
      errors: [{ messageId: 'textDecoderInLoop' }],
    },
    {
      code: 'stream.on("data", chunk => { new TextDecoder().decode(chunk); })',
      errors: [{ messageId: 'textDecoderInLoop' }],
    },
    {
      code: 'arr.forEach(x => { new util.TextDecoder().decode(x); })',
      errors: [{ messageId: 'textDecoderInLoop' }],
    },
    {
      code: 'for (let i = 0; i < n; i++) { new TextDecoder("utf-8").decode(b); }',
      errors: [{ messageId: 'textDecoderInLoop' }],
    },
  ],
});

console.log('no-textdecoder-in-loop: ok');
