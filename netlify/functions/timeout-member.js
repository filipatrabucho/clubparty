import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const { discord_id, reason, duration_minutes } = await req.json();
  if (!discord_id || !duration_minutes) {
    return new Response('Missing fields', { status: 400 });
  }

  const until = new Date(Date.now() + duration_minutes * 60 * 1000).toISOString();

  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${discord_id}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ communication_disabled_until: until }),
    }
  );

  if (!res.ok) return new Response('Erro ao castigar membro', { status: 500 });

  await supabase.from('mod_logs').insert({
    target_discord_id: discord_id,
    moderator_discord_id: user.discord_id,
    action: 'timeout',
    reason,
    source: 'manual',
    duration_minutes,
    expires_at: until,
  });

  return Response.json({ success: true });
};