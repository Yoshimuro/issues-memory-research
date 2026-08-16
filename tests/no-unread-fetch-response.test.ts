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

    // Binding declared in an outer scope: resolution must walk the scope chain.
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
      // Consumed outside the assigning block.
      code: `async function ok(url, cond) {
        let r;
        if (cond) {
          r = await fetch(url);
        }
        await r?.json();
      }`,
    },
    {
      // Mutually exclusive writes, one shared consumer.
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
      // Loop body — two scopes deep.
      code: `async function ok(urls) {
        let r;
        for (const url of urls) {
          r = await fetch(url);
          await r.json();
        }
      }`,
    },

    // Each assignment is judged by the references in its own live window.
    {
      // Cancelled before the binding is reused.
      code: `async function ok(url) {
        let r = await fetch(url);
        r.body?.cancel();
        r = await fetch(url);
        await r.json();
      }`,
    },
    {
      // Same, with the second response handed to the caller.
      code: `async function ok(url, cond) {
        let r = await fetch(url);
        if (cond) {
          r.body?.cancel();
          r = await fetch(url);
        }
        return r;
      }`,
      options: [{ allowReturnResponse: true }],
    },
    {
      // Different switch cases never overwrite each other.
      code: `async function ok(url, cond) {
        let r;
        switch (cond) {
          case 1: r = await fetch(url); break;
          default: r = await fetch(other);
        }
        await r.json();
      }`,
    },
    {
      // catch only runs when try threw.
      code: `async function ok(url) {
        let r;
        try {
          r = await fetch(url);
        } catch {
          r = await fetch(other);
        }
        await r.json();
      }`,
    },
    {
      // Each iteration consumes the previous response, the trailing call the last.
      code: `async function ok(urls) {
        let r;
        for (const url of urls) {
          await r?.json();
          r = await fetch(url);
        }
        await r?.json();
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

    // Resolving the binding must not silence an unconsumed response.
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
      // One report per fetch, not per binding.
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

    // A later consumer must not cover a response that was already overwritten.
    {
      code: `async function bad(url) {
        let r = await fetch(url);
        r = await fetch(url);
        await r.json();
      }`,
      errors: [{ messageId: 'overwrittenFetchResponse', data: { name: 'r' } }],
    },
    {
      // Overwrite on one path is enough to leak.
      code: `async function bad(url, cond) {
        let r = await fetch(url);
        if (cond) {
          r = await fetch(other);
        }
        await r.json();
      }`,
      errors: [{ messageId: 'overwrittenFetchResponse' }],
    },
    {
      // The overwriting value need not be another fetch.
      code: `async function bad(url) {
        let r = await fetch(url);
        r = null;
      }`,
      errors: [{ messageId: 'overwrittenFetchResponse' }],
    },
    {
      // Returning the second response still needs the opt-in.
      code: `async function bad(url, cond) {
        let r = await fetch(url);
        if (cond) {
          r.body?.cancel();
          r = await fetch(url);
        }
        return r;
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
    {
      // Same loop without the trailing call: the last response is never consumed.
      code: `async function bad(urls) {
        let r;
        for (const url of urls) {
          await r?.json();
          r = await fetch(url);
        }
      }`,
      errors: [{ messageId: 'unreadFetchResponse' }],
    },
  ],
});

console.log('no-unread-fetch-response: ok');
