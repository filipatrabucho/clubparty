import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req, context) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  // 1. Troca o code por access_token
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    console.log('Discord token error:', tokenRes.status, errBody);
    return new Response('Erro ao obter token: ' + errBody, { status: 400 });
  }

  const { access_token } = await tokenRes.json();

  // 2. Busca dados do user
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const discordUser = await userRes.json();

  // 3. Verifica se é membro do servidor + role
  const memberRes = await fetch(
    `https://discord.com/api/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  if (!memberRes.ok) {
    return new Response('Não és membro do servidor Club Party', { status: 403 });
  }

  const member = await memberRes.json();

  // 4. Define dashboard_role com base nos roles do Discord
  const ADMIN_ROLE_ID = process.env.DISCORD_ADMIN_ROLE_ID;   // Founder
  const MOD_ROLE_ID = process.env.DISCORD_MOD_ROLE_ID;       // Moderator
  const HELPER_ROLE_ID = process.env.DISCORD_HELPER_ROLE_ID; // Helper / Support

  let dashboardRole = 'member';
  if (member.roles.includes(ADMIN_ROLE_ID)) {
    dashboardRole = 'admin';
  } else if (member.roles.includes(MOD_ROLE_ID)) {
    dashboardRole = 'mod';
  } else if (member.roles.includes(HELPER_ROLE_ID)) {
    dashboardRole = 'helper';
  }

  // 5. Guarda/atualiza na Supabase
  const avatarUrl = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : null;

  await supabase.from('users').upsert({
    discord_id: discordUser.id,
    username: discordUser.username,
    global_name: discordUser.global_name,
    avatar_url: avatarUrl,
    discord_roles: member.roles,
    dashboard_role: dashboardRole,
    last_login: new Date().toISOString(),
  }, { onConflict: 'discord_id' });

  // 6. Cria sessão JWT em cookie httpOnly
  const sessionToken = jwt.sign(
    {
      discord_id: discordUser.id,
      username: discordUser.username,
      avatar_url: avatarUrl,
      dashboard_role: dashboardRole,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const sessionCookie = cookie.serialize('session', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  // 7. Redireciona com base no nível de acesso
  const STAFF_ROLES = ['helper', 'mod', 'admin'];
  const redirectTo = STAFF_ROLES.includes(dashboardRole) ? '/dashboard' : '/perfil';

  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': sessionCookie,
      Location: redirectTo,
    },
  });
};