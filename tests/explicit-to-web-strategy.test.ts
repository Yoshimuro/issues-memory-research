import { RuleTester } from '@typescript-eslint/rule-tester';
import parser from '@typescript-eslint/parser';
import rule from '../dist/rules/explicit-to-web-strategy.js';

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

ruleTester.run('explicit-to-web-strategy', rule, {
  valid: [
    'Readable.toWeb(stream, { strategy: new ByteLengthQueuingStrategy({ highWaterMark: 16384 }) })',
    'stream.Readable.toWeb(s, { strategy: new ByteLengthQueuingStrategy({ highWaterMark: 1 }) })',
    'const strategy = new ByteLengthQueuingStrategy({ highWaterMark: 1 }); Readable.toWeb(s, { strategy })',
    'other.method(stream)',
  ],
  invalid: [
    {
      code: 'Readable.toWeb(stream)',
      errors: [{ messageId: 'missingStrategy' }],
      output: 'Readable.toWeb(stream, { strategy: new ByteLengthQueuingStrategy({ highWaterMark: stream.readableHighWaterMark ?? 16384 }) })',
    },
    {
      code: 'readable.toWeb(nodeStream)',
      errors: [{ messageId: 'missingStrategy' }],
      output: 'readable.toWeb(nodeStream, { strategy: new ByteLengthQueuingStrategy({ highWaterMark: nodeStream.readableHighWaterMark ?? 16384 }) })',
    },
    {
      code: 'Readable.toWeb(stream, {})',
      errors: [{ messageId: 'missingStrategy' }],
    },
    {
      code: 'Readable.toWeb(stream, { strategy: new CountQueuingStrategy({ highWaterMark: 1 }) })',
      errors: [{ messageId: 'invalidStrategy' }],
    },
    {
      code: 'Readable.toWeb(stream, { strategy: foo })',
      errors: [{ messageId: 'invalidStrategy' }],
    },
  ],
});

console.log('explicit-to-web-strategy: ok');
