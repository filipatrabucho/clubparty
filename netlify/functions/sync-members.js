import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members?limit=1000`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );

  if (!res.ok) {
    const errBody = await res.text();
    console.log('Discord members error:', res.status, errBody);
    return Response.json({ error: errBody, status: res.status }, { status: 500 });
  }

  const members = await res.json();

  const rows = members.map(m => ({
    discord_id: m.user.id,
    username: m.user.username,
    avatar_url: m.user.avatar
      ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png`
      : null,
    roles: m.roles,
    joined_at: m.joined_at,
    is_member: true,
    last_synced: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from('guild_cache')
    .upsert(rows, { onConflict: 'discord_id' });

  if (upsertError) {
    console.log('Supabase upsert error:', upsertError);
    return Response.json({ error: upsertError.message }, { status: 500 });
  }

  return Response.json({ synced: rows.length });
};