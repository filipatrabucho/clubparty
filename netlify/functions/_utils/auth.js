import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export function getSessionUser(req) {
  const cookies = cookie.parse(req.headers.get('cookie') || '');
  const token = cookies.session;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireRole(user, roles = ['helper', 'mod', 'admin']) {
  if (!user || !roles.includes(user.dashboard_role)) {
    return new Response('Forbidden', { status: 403 });
  }
  return null; // ok
}