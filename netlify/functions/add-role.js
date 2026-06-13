import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const { discord_id, role_id } = await req.json();
  if (!discord_id || !role_id) return new Response('Missing fields', { status: 400 });

  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${discord_id}/roles/${role_id}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    }
  );

  if (!res.ok && res.status !== 204) {
    const err = await res.json();
    return Response.json({ success: false, error: err }, { status: 500 });
  }

  // Atualiza cache local
  const { data: member } = await supabase
    .from('guild_cache')
    .select('roles')
    .eq('discord_id', discord_id)
    .single();

  const updatedRoles = Array.from(new Set([...(member?.roles || []), role_id]));

  await supabase
    .from('guild_cache')
    .update({ roles: updatedRoles })
    .eq('discord_id', discord_id);

  // Log
  await supabase.from('mod_logs').insert({
    target_discord_id: discord_id,
    moderator_discord_id: user.discord_id,
    action: 'role_add',
    reason: `Cargo ${role_id} adicionado`,
    source: 'manual',
  });

  return Response.json({ success: true });
};