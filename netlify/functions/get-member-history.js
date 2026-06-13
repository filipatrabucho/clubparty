import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const url = new URL(req.url);
  const discord_id = url.searchParams.get('discord_id');
  if (!discord_id) return new Response('Missing discord_id', { status: 400 });

  const { data: logs, error: logsError } = await supabase
    .from('mod_logs')
    .select('*')
    .eq('target_discord_id', discord_id)
    .order('created_at', { ascending: false });

  if (logsError) return new Response(logsError.message, { status: 500 });

  const { data: warnings, error: warnError } = await supabase
    .from('warnings')
    .select('*')
    .eq('discord_id', discord_id)
    .order('created_at', { ascending: false });

  if (warnError) return new Response(warnError.message, { status: 500 });

  const { data: member } = await supabase
    .from('guild_cache')
    .select('*')
    .eq('discord_id', discord_id)
    .single();

  // Busca roles do servidor (para traduzir IDs de cargo)
  const rolesRes = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/roles`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );
  const guildRoles = rolesRes.ok ? await rolesRes.json() : [];
  const roleMap = {};
  guildRoles.forEach(r => { roleMap[r.id] = r.name; });

  // Busca nomes dos moderadores envolvidos (cache local primeiro)
  const moderatorIds = [...new Set(logs.map(l => l.moderator_discord_id).filter(Boolean))];
  const { data: moderators } = await supabase
    .from('guild_cache')
    .select('discord_id, username')
    .in('discord_id', moderatorIds.length > 0 ? moderatorIds : ['none']);

  const moderatorMap = {};
  (moderators || []).forEach(m => { moderatorMap[m.discord_id] = m.username; });

  // Enriquece os logs
  const enrichedLogs = logs.map(log => {
    let reason = log.reason;

    // Substitui "Cargo {ID} adicionado/removido" pelo nome do cargo
    const roleIdMatch = reason?.match(/Cargo (\d{17,20})/);
    if (roleIdMatch) {
      const roleId = roleIdMatch[1];
      const roleName = roleMap[roleId] || roleId;
      reason = reason.replace(roleId, `"${roleName}"`);
    }

    return {
      ...log,
      reason,
      moderator_name: log.moderator_discord_id
        ? (moderatorMap[log.moderator_discord_id] || log.moderator_discord_id)
        : null,
    };
  });

  return Response.json({ member, logs: enrichedLogs, warnings });
};