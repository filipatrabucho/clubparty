import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async (req) => {
  const cookies = cookie.parse(req.headers.get('cookie') || '');
  const token = cookies.session;

  if (!token) {
    return Response.json({ user: null }, { status: 200 });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return Response.json({ user }, { status: 200 });
  } catch {
    return Response.json({ user: null }, { status: 200 });
  }
};