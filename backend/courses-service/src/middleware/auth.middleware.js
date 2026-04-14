// Microservice auth middleware — validates the bearer token by calling
// auth_service /validate over HTTP. This service never queries auth's DB.

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';

async function validateToken(token) {
  const response = await fetch(`${AUTH_SERVICE_URL}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!data?.valid) return null;
  return data.user; // { user_id, role }
}

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    const user = await validateToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    req.user = user;
    next();
  } catch (err) {
    console.error('[courses-service] auth middleware failed', err);
    res.status(500).json({ error: 'Auth middleware failed' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Optional auth — attaches req.user if a valid token is present, but lets the
// request through either way. Used on public list/detail routes that behave
// slightly differently for logged-in users.
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();
    const token = authHeader.split(' ')[1];
    const user = await validateToken(token);
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}
