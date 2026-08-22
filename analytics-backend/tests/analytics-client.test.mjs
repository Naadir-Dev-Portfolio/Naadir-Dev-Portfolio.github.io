import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const CLIENT_PATH = new URL('../../assets/js/analytics.js', import.meta.url);
const VISIT_ID = '123e4567-e89b-42d3-a456-426614174000';

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

test('client counts only visible time and keeps its visit ID in memory', async () => {
  const source = await readFile(CLIENT_PATH, 'utf8');
  const calls = [];
  const documentListeners = new Map();
  const windowListeners = new Map();
  const intervalCallbacks = [];
  let now = 0;

  const document = {
    currentScript: {
      dataset: { worker: 'https://portfolio-analytics.example.workers.dev' },
    },
    readyState: 'complete',
    visibilityState: 'visible',
    addEventListener(name, callback) {
      documentListeners.set(name, callback);
    },
  };

  const window = {
    location: { pathname: '/python' },
    addEventListener(name, callback) {
      windowListeners.set(name, callback);
    },
    setInterval(callback) {
      intervalCallbacks.push(callback);
      return 1;
    },
  };

  const context = {
    document,
    window,
    performance: { now: () => now },
    fetch: async (url, options) => {
      calls.push({ url, options });
      if (url.endsWith('/visit')) {
        return { ok: true, json: async () => ({ id: VISIT_ID }) };
      }
      return { ok: true };
    },
  };

  vm.runInNewContext(source, context, { filename: 'analytics.js' });
  await flushPromises();

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://portfolio-analytics.example.workers.dev/visit');
  assert.deepEqual(JSON.parse(calls[0].options.body), { page: '/python' });
  assert.equal(intervalCallbacks.length, 1);

  now = 15_000;
  intervalCallbacks[0]();
  await flushPromises();
  assert.equal(JSON.parse(calls.at(-1).options.body).active_seconds, 15);

  now = 22_000;
  document.visibilityState = 'hidden';
  documentListeners.get('visibilitychange')();
  await flushPromises();
  assert.equal(JSON.parse(calls.at(-1).options.body).active_seconds, 22);

  const callCountWhileHidden = calls.length;
  now = 82_000;
  intervalCallbacks[0]();
  await flushPromises();
  assert.equal(calls.length, callCountWhileHidden);

  document.visibilityState = 'visible';
  documentListeners.get('visibilitychange')();
  now = 87_000;
  windowListeners.get('pagehide')();
  await flushPromises();
  const finalCall = calls.at(-1);
  assert.equal(JSON.parse(finalCall.options.body).active_seconds, 27);
  assert.equal(finalCall.options.keepalive, true);

  vm.runInNewContext(source, context, { filename: 'analytics-second-load.js' });
  await flushPromises();
  assert.equal(calls.filter(call => call.url.endsWith('/visit')).length, 1);
  assert.equal(window.__portfolioPrivateAnalyticsStarted, true);
});
