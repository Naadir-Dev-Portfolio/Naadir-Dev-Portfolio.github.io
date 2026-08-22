const ALLOWED_ORIGIN = 'https://naadir-dev-portfolio.github.io';
const MAX_BODY_BYTES = 2048;
const MAX_PAGE_LENGTH = 512;
const MAX_ACTIVE_SECONDS = 7 * 24 * 60 * 60;
const VISIT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TRANSPARENT_GIF = new Uint8Array([
  71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0,
  255, 255, 255, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0,
  1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
]);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonResponse(value, status = 200, allowCors = false) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
  if (allowCors) Object.assign(headers, corsHeaders());
  return new Response(JSON.stringify(value), { status, headers });
}

function pixelResponse() {
  return new Response(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(TRANSPARENT_GIF.byteLength),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function visitorIp(request) {
  const value = request.headers.get('CF-Connecting-IP');
  return value && value.length <= 64 ? value : 'unknown';
}

function visitorCountry(request) {
  const value = String(request.cf?.country || 'XX').toUpperCase();
  return /^[A-Z0-9]{2}$/.test(value) ? value : 'XX';
}

function normalizePage(value) {
  if (typeof value !== 'string' || !value || value.length > MAX_PAGE_LENGTH) {
    throw new HttpError(400, 'Invalid page');
  }

  let url;
  try {
    url = new URL(value, ALLOWED_ORIGIN);
  } catch {
    throw new HttpError(400, 'Invalid page');
  }

  if (url.origin !== ALLOWED_ORIGIN || url.pathname.length > MAX_PAGE_LENGTH) {
    throw new HttpError(400, 'Invalid page');
  }
  return url.pathname || '/';
}

async function readJson(request) {
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new HttpError(413, 'Request body too large');
  }

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw new HttpError(415, 'Expected application/json');
  }

  const text = await request.text();
  if (!text || text.length > MAX_BODY_BYTES) {
    throw new HttpError(text ? 413 : 400, text ? 'Request body too large' : 'Missing request body');
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
}

async function insertVisit(env, request, page, trackingMethod) {
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(`
    INSERT INTO visits (
      id, ip_address, country, page, started_at, last_seen_at,
      active_seconds, tracking_method
    ) VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).bind(
    id,
    visitorIp(request),
    visitorCountry(request),
    page,
    now,
    now,
    trackingMethod,
  ).run();
  return id;
}

async function handleVisit(request, env) {
  const body = await readJson(request);
  const page = normalizePage(body.page);
  const id = await insertVisit(env, request, page, 'javascript');
  return jsonResponse({ id, heartbeat_seconds: 15 }, 201, true);
}

async function handleHeartbeat(request, env) {
  const body = await readJson(request);
  if (typeof body.id !== 'string' || !VISIT_ID_PATTERN.test(body.id)) {
    throw new HttpError(400, 'Invalid visit ID');
  }

  const activeSeconds = Number(body.active_seconds);
  if (!Number.isInteger(activeSeconds) || activeSeconds < 0 || activeSeconds > MAX_ACTIVE_SECONDS) {
    throw new HttpError(400, 'Invalid active time');
  }

  const now = Math.floor(Date.now() / 1000);
  const result = await env.DB.prepare(`
    UPDATE visits
    SET last_seen_at = ?,
        active_seconds = CASE
          WHEN active_seconds < ? THEN ?
          ELSE active_seconds
        END
    WHERE id = ? AND tracking_method = 'javascript'
  `).bind(now, activeSeconds, activeSeconds, body.id).run();

  const changes = Number(result?.meta?.changes ?? result?.changes ?? 0);
  if (changes < 1) throw new HttpError(404, 'Visit not found');
  return jsonResponse({ ok: true }, 200, true);
}

async function handlePixel(request, env, url) {
  try {
    const page = normalizePage(url.searchParams.get('page') || '/');
    await insertVisit(env, request, page, 'pixel');
  } catch {
    // A failed analytics write must never create a broken image on the site.
  }
  return pixelResponse();
}

function methodNotAllowed(allow, allowCors = false) {
  const response = jsonResponse({ error: 'Method not allowed' }, 405, allowCors);
  response.headers.set('Allow', allow);
  return response;
}

export async function handleRequest(request, env) {
  const url = new URL(request.url);
  const isJavascriptEndpoint = url.pathname === '/visit' || url.pathname === '/heartbeat';
  const originAllowed = request.headers.get('Origin') === ALLOWED_ORIGIN;

  if (request.method === 'OPTIONS' && isJavascriptEndpoint) {
    if (!originAllowed) return jsonResponse({ error: 'Origin not allowed' }, 403);
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (url.pathname === '/' && request.method === 'GET') {
    return jsonResponse({ service: 'portfolio-analytics', status: 'ok' });
  }

  if (url.pathname === '/pixel') {
    if (request.method !== 'GET') return methodNotAllowed('GET');
    return handlePixel(request, env, url);
  }

  if (isJavascriptEndpoint) {
    if (!originAllowed) return jsonResponse({ error: 'Origin not allowed' }, 403);
    if (request.method !== 'POST') return methodNotAllowed('POST, OPTIONS', true);

    try {
      return url.pathname === '/visit'
        ? await handleVisit(request, env)
        : await handleHeartbeat(request, env);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      const message = error instanceof HttpError ? error.message : 'Analytics unavailable';
      return jsonResponse({ error: message }, status, true);
    }
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  },
};
