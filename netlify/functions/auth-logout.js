import cookie from 'cookie';

export default async () => {
  const expiredCookie = cookie.serialize('session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': expiredCookie,
      Location: '/',
    },
  });
};