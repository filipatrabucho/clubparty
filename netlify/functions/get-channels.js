import { getSessionUser, requireRole } from './_utils/auth.js';

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/channels`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );

  if (!res.ok) return new Response('Erro ao buscar canais', { status: 500 });

  const channels = await res.json();

  const textChannels = channels
    .filter(c => c.type === 0)
    .map(c => ({ id: c.id, name: c.name, position: c.position }))
    .sort((a, b) => a.position - b.position);

  return Response.json({ channels: textChannels });
};