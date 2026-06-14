import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  
  const user = getSessionUser(req);
  const forbidden = requireRole(user, ['mod', 'admin']);
  if (forbidden) return forbidden;

  const { discord_id, reason, delete_message_days } = await req.json();
  if (!discord_id) return new Response('Missing discord_id', { status: 400 });

  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/bans/${discord_id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        delete_message_seconds: (delete_message_days || 0) * 86400,
      }),
    }
  );

  if (!res.ok && res.status !== 204) {
    return new Response('Erro ao banir membro', { status: 500 });
  }

  await supabase.from('mod_logs').insert({
    target_discord_id: discord_id,
    moderator_discord_id: user.discord_id,
    action: 'ban',
    reason,
    source: 'manual',
  });

  await supabase.from('guild_cache').update({ is_member: false }).eq('discord_id', discord_id);

  return Response.json({ success: true });
};