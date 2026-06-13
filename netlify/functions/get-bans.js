import { getSessionUser, requireRole } from './_utils/auth.js';

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/bans?limit=1000`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );

  if (!res.ok) return new Response('Erro ao buscar banidos', { status: 500 });

  const bans = await res.json();

  const result = bans.map(b => ({
    discord_id: b.user.id,
    username: b.user.username,
    avatar_url: b.user.avatar
      ? `https://cdn.discordapp.com/avatars/${b.user.id}/${b.user.avatar}.png`
      : null,
    reason: b.reason,
  }));

  return Response.json({ bans: result });
};