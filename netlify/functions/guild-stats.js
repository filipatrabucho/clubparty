/* export default async () => {
  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}?with_counts=true`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );

  if (!res.ok) return Response.json({ total: '?', online: '?' });

  const data = await res.json();
  return Response.json({
    total: data.approximate_member_count,
    online: data.approximate_presence_count,
  });
}; */

export default async () => {
  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}?with_counts=true`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );

  const data = await res.json();

  if (!res.ok) {
    console.log('Discord API error:', res.status, data);
    return Response.json({ total: '?', online: '?', debug: data, status: res.status });
  }

  return Response.json({
    total: data.approximate_member_count,
    online: data.approximate_presence_count,
  });
};