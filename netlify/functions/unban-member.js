import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const { discord_id, reason } = await req.json();
  if (!discord_id) return new Response('Missing discord_id', { status: 400 });

  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/bans/${discord_id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'X-Audit-Log-Reason': encodeURIComponent(reason || 'Sem motivo'),
      },
    }
  );

  if (!res.ok && res.status !== 204) {
    const err = await res.json();
    return Response.json({ success: false, error: err }, { status: 500 });
  }

  await supabase.from('mod_logs').insert({
    target_discord_id: discord_id,
    moderator_discord_id: user.discord_id,
    action: 'unban',
    reason,
    source: 'manual',
  });

  return Response.json({ success: true });
};