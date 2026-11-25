const http = require('node:http');

const PORT = Number(process.env.PORT || 3000);
const MPS_FUNCTION_URL = process.env.MPS_FUNCTION_URL;
const MPS_AUTH_TOKEN = process.env.MPS_AUTH_TOKEN;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const OPERATIONS = new Set(['vibration', 'beam', 'heat', 'calculus', 'linear', 'optimize']);
const MAX_BODY_BYTES = 4096;

function send(res, status, body, origin) {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
  if (origin && (origin === ALLOWED_ORIGIN || (!ALLOWED_ORIGIN && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)))) {
    headers['access-control-allow-origin'] = origin;
    headers.vary = 'Origin';
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function validMpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname));
  } catch {
    return false;
  }
}

async function readJson(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) throw Object.assign(new Error('Request too large'), { status: 413 });
  }
  try { return JSON.parse(body); }
  catch { throw Object.assign(new Error('Request body must be valid JSON'), { status: 400 }); }
}

function parseMpsResult(payload) {
  if (!payload || !Array.isArray(payload.lhs) || typeof payload.lhs[0] !== 'string') throw new Error('Unexpected MATLAB response');
  const result = JSON.parse(payload.lhs[0]);
  if (!result || !Array.isArray(result.x) || !Array.isArray(result.y) || result.x.length !== result.y.length || result.x.length < 2 || result.x.length > 1201 || !result.x.every(Number.isFinite) || !result.y.every(Number.isFinite) || typeof result.summary !== 'string') {
    throw new Error('Invalid result returned by MATLAB');
  }
  return result;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  if (req.method === 'OPTIONS') {
    if (ALLOWED_ORIGIN && origin !== ALLOWED_ORIGIN) return send(res, 403, { error: 'Origin not allowed' });
    res.writeHead(204, { 'access-control-allow-origin': origin || ALLOWED_ORIGIN || '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '600', vary: 'Origin' });
    return res.end();
  }
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { status: 'ok' }, origin);
  if (req.method !== 'POST' || req.url !== '/api/run') return send(res, 404, { error: 'Not found' }, origin);
  if (ALLOWED_ORIGIN && origin !== ALLOWED_ORIGIN) return send(res, 403, { error: 'Origin not allowed' });
  if (!MPS_FUNCTION_URL || !validMpsUrl(MPS_FUNCTION_URL)) return send(res, 503, { error: 'MATLAB Production Server is not configured' }, origin);

  try {
    const input = await readJson(req);
    if (!input || !OPERATIONS.has(input.operation)) return send(res, 400, { error: 'Unsupported solver operation' }, origin);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const upstream = await fetch(MPS_FUNCTION_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(MPS_AUTH_TOKEN ? { authorization: `Bearer ${MPS_AUTH_TOKEN}` } : {}) },
        body: JSON.stringify({ rhs: [input.operation], nargout: 1, outputFormat: { mode: 'small', nanInfFormat: 'string' } }),
        signal: controller.signal
      });
      if (!upstream.ok) return send(res, 502, { error: `MATLAB service returned HTTP ${upstream.status}` }, origin);
      const result = parseMpsResult(await upstream.json());
      return send(res, 200, result, origin);
    } finally { clearTimeout(timeout); }
  } catch (error) {
    const status = error.status || 502;
    return send(res, status, { error: status < 500 ? error.message : 'MATLAB analysis failed or returned an invalid response' }, origin);
  }
});

server.listen(PORT, () => console.log(`MatEngine MATLAB bridge listening on port ${PORT}`));
