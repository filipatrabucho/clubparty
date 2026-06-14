import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const source = url.searchParams.get('source');

  let query = supabase
    .from('mod_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (action) query = query.eq('action', action);
  if (source) query = query.eq('source', source);

  const { data: logs, error } = await query;
  if (error) return new Response(error.message, { status: 500 });

  // Enriquece com nomes (cargo, moderador, target)
  const targetIds = [...new Set(logs.map(l => l.target_discord_id).filter(Boolean))];
  const moderatorIds = [...new Set(logs.map(l => l.moderator_discord_id).filter(Boolean))];
  const allIds = [...new Set([...targetIds, ...moderatorIds])];

  const { data: cachedUsers } = await supabase
    .from('guild_cache')
    .select('discord_id, username')
    .in('discord_id', allIds.length > 0 ? allIds : ['none']);

  const userMap = {};
  (cachedUsers || []).forEach(u => { userMap[u.discord_id] = u.username; });

  // Busca roles do servidor (para traduzir IDs de cargo no reason)
  const rolesRes = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/roles`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );
  const guildRoles = rolesRes.ok ? await rolesRes.json() : [];
  const roleMap = {};
  guildRoles.forEach(r => { roleMap[r.id] = r.name; });

  const enriched = logs.map(log => {
    let reason = log.reason;
    const roleIdMatch = reason?.match(/Cargo (\d{17,20})/);
    if (roleIdMatch) {
      const roleId = roleIdMatch[1];
      reason = reason.replace(roleId, `"${roleMap[roleId] || roleId}"`);
    }

    return {
      ...log,
      target_username: userMap[log.target_discord_id] || log.target_username || log.target_discord_id,
      moderator_name: log.moderator_discord_id
        ? (userMap[log.moderator_discord_id] || log.moderator_discord_id)
        : null,
      reason,
    };
  });

  return Response.json({ logs: enriched });
};