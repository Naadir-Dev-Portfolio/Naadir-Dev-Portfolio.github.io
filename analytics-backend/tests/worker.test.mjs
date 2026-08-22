import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest } from '../worker.mjs';

const ORIGIN = 'https://naadir-dev-portfolio.github.io';

class MockDatabase {
  constructor() {
    this.rows = new Map();
  }

  prepare(sql) {
    return {
      bind: (...values) => ({
        run: async () => {
          if (/INSERT INTO visits/i.test(sql)) {
            const [id, ip, country, page, started, lastSeen, method] = values;
            this.rows.set(id, {
              id,
              ip_address: ip,
              country,
              page,
              started_at: started,
              last_seen_at: lastSeen,
              active_seconds: 0,
              tracking_method: method,
            });
            return { meta: { changes: 1 } };
          }

          if (/UPDATE visits/i.test(sql)) {
            const [lastSeen, activeSeconds, , id] = values;
            const row = this.rows.get(id);
            if (!row || row.tracking_method !== 'javascript') {
              return { meta: { changes: 0 } };
            }
            row.last_seen_at = lastSeen;
            row.active_seconds = Math.max(row.active_seconds, activeSeconds);
            return { meta: { changes: 1 } };
          }

          throw new Error('Unexpected SQL in mock database');
        },
      }),
    };
  }
}

function request(path, options = {}, cf = { country: 'GB' }) {
  const headers = new Headers(options.headers || {});
  headers.set('CF-Connecting-IP', '203.0.113.42');
  const result = new Request(`https://analytics.example${path}`, { ...options, headers });
  Object.defineProperty(result, 'cf', { value: cf });
  return result;
}

test('JavaScript visit trusts Cloudflare IP and creates one row', async () => {
  const DB = new MockDatabase();
  const response = await handleRequest(request('/visit', {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: '/python', ip_address: '1.2.3.4' }),
  }), { DB });

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.match(body.id, /^[0-9a-f-]{36}$/i);
  assert.equal(DB.rows.size, 1);
  const row = DB.rows.get(body.id);
  assert.equal(row.ip_address, '203.0.113.42');
  assert.equal(row.country, 'GB');
  assert.equal(row.page, '/python');
  assert.equal(row.tracking_method, 'javascript');
});

test('heartbeats update the same row and never double-count retries', async () => {
  const DB = new MockDatabase();
  const visitResponse = await handleRequest(request('/visit', {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: '/etl' }),
  }), { DB });
  const { id } = await visitResponse.json();

  for (const seconds of [15, 15, 9, 31]) {
    const response = await handleRequest(request('/heartbeat', {
      method: 'POST',
      headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active_seconds: seconds }),
    }), { DB });
    assert.equal(response.status, 200);
  }

  assert.equal(DB.rows.size, 1);
  assert.equal(DB.rows.get(id).active_seconds, 31);
});

test('JavaScript endpoints reject other origins', async () => {
  const DB = new MockDatabase();
  const response = await handleRequest(request('/visit', {
    method: 'POST',
    headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: '/' }),
  }), { DB });

  assert.equal(response.status, 403);
  assert.equal(DB.rows.size, 0);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
});

test('pixel inserts a fallback row and always returns an uncached image', async () => {
  const DB = new MockDatabase();
  const response = await handleRequest(request('/pixel?page=%2F'), { DB });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'image/gif');
  assert.match(response.headers.get('Cache-Control'), /no-store/);
  assert.equal(DB.rows.size, 1);
  assert.equal([...DB.rows.values()][0].tracking_method, 'pixel');
});
