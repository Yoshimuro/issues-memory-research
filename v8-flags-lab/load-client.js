#!/usr/bin/env node
'use strict';

const http = require('node:http');

const URL_VALUE = process.env.URL || 'http://localhost:3000/mixed';
const DURATION_S = Number(process.env.DURATION_S || 30);
const CONCURRENCY = Number(process.env.CONCURRENCY || 50);
const url = new URL(URL_VALUE);
const endAt = Date.now() + DURATION_S * 1000;
const stats = { requests: 0, errors: 0, bytes: 0 };

function requestOnce() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        timeout: 5000,
      },
      (res) => {
        res.on('data', (chunk) => {
          stats.bytes += chunk.length;
        });
        res.on('end', () => {
          stats.requests += 1;
          resolve();
        });
      }
    );
    req.on('timeout', () => {
      req.destroy();
    });
    req.on('error', () => {
      stats.errors += 1;
      resolve();
    });
    req.end();
  });
}

async function worker() {
  while (Date.now() < endAt) {
    await requestOnce();
  }
}

async function run() {
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log(JSON.stringify(stats, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
