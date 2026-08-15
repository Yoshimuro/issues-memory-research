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
        // for HEAD query r.body === null
        const r = await fetch(url, { method: 'HEAD', credentials: 'omit' });
        return r.headers.get('content-length');
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

    // Binding declared in an outer scope, assigned inside a nested block:
    // the rule must resolve it through the scope chain, not only in the
    // innermost scope of the fetch call.
    {
      code: `async function ok(url, cond) {
        let r;
        if (cond) {
          r = await fetch(url);
          await r.json();
        }
      }`,
    },
    {
      // Consumed after the block that assigns it.
      code: `async function ok(url, cond) {
        let r;
        if (cond) {
          r = await fetch(url);
        }
        await r?.json();
      }`,
    },
    {
      // Both branches assign, one consumer covers either one.
      code: `async function ok(url, cond) {
        let r;
        if (cond) {
          r = await fetch(url);
        } else {
          r = await fetch(other);
        }
        await r.json();
      }`,
    },
    {
      // Assignment inside a loop body.
      code: `async function ok(urls) {
        let r;
        for (const url of urls) {
          r = await fetch(url);
          await r.json();
        }
      }`,
    },
    {
      // Assignment inside try, consumed in the same block.
      code: `async function ok(url) {
        let r;
        try {
          r = await fetch(url);
          await r.text();
        } catch {}
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

    // Resolving the outer binding must not make every nested assignment valid —
    // an unconsumed response is still reported.
    {
      code: `async function bad(url, cond) {
        let r;
        if (cond) {
          r = await fetch(url);
        }
        console.log(r?.status);
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
    {
      // One report per unconsumed fetch, not one per binding.
      code: `async function bad(url, cond) {
        let r;
        if (cond) {
          r = await fetch(url);
        } else {
          r = await fetch(other);
        }
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }, { messageId: 'unreadFetchResponse' }],
    },
  ],
});

console.log('no-unread-fetch-response: ok');
