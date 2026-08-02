import { RuleTester } from '@typescript-eslint/rule-tester';
import parser from '@typescript-eslint/parser';
import rule from '../dist/rules/no-unread-fetch-response.js';

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

ruleTester.run('no-unread-fetch-response', rule, {
  valid: [
    {
      code: `async function ok() {
        const r = await fetch(url);
        await r.json();
      }`,
    },
    {
      code: `async function ok() {
        (await fetch(url)).json();
      }`,
    },
    {
      code: `async function ok() {
        const r = await fetch(url);
        await r.text();
      }`,
    },
    {
      code: `async function ok() {
        const r = await fetch(url);
        await r.arrayBuffer();
      }`,
    },
    {
      code: `async function ok() {
        const r = await fetch(url);
        await r.blob();
      }`,
    },
    {
      code: `async function ok() {
        const r = await fetch(url);
        await r.formData();
      }`,
    },
    {
      code: `async function ok() {
        const r = await fetch(url);
        r.body.getReader();
      }`,
    },
    {
      code: `async function ok() {
        const r = await fetch(url);
        await r.body?.cancel();
      }`,
    },
    {
      code: `async function ok() {
        const r = await fetch(url);
        await r.body.cancel();
      }`,
    },
    {
      code: `async function ok() {
        const r = await globalThis.fetch(url);
        await r.json();
      }`,
    },
    {
      code: `async function ok() {
        let r;
        r = await fetch(url);
        await r.json();
      }`,
    },
    {
      code: `async function ok() {
        await fetch(url).then(r => r.text());
      }`,
    },
    {
      code: `async function ok() {
        return await fetch(url);
      }`,
      options: [{ allowReturnResponse: true }],
    },
    {
      code: `async function ok() {
        const r = await customFetch(url);
        await r.json();
      }`,
      options: [{ fetchNames: ['customFetch'] }],
    },
    {
      code: `async function ok() {
        const r = await fetch(url);
        await r.bytes();
      }`,
      options: [{ additionalConsumeMethods: ['bytes'] }],
    },
    {
      code: `async function ok() {
        await other(url);
      }`,
    },
    {
      code: `async function ok<T>({ fetch }: TRequestOptions<T>): Promise<T> {
        return await fetch();
      }`,
    },
  ],
  invalid: [
    {
      code: `async function bad() {
        await fetch(url);
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
    {
      code: `async function bad() {
        const r = await fetch(url);
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
    {
      code: `async function bad() {
        const r = await fetch(url);
        if (!r.ok) return;
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
    {
      code: `async function bad() {
        const r = await fetch(url);
        console.log(r.status);
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
    {
      code: `async function bad() {
        const r = await fetch(url);
        if (!r.ok) {
          throw new Error('fail');
        }
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
    {
      code: `async function bad() {
        let r;
        r = await fetch(url);
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
    {
      code: `async function bad() {
        const r = await globalThis.fetch(url);
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
    {
      code: `async function bad() {
        const r = await customFetch(url);
      }`,
      options: [{ fetchNames: ['customFetch'] }],
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
    {
      code: `async function bad() {
        return await fetch(url);
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
  ],
});

console.log('no-unread-fetch-response: ok');
