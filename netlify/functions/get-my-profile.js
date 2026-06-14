import { createClient } from '@supabase/supabase-js';
import { getSessionUser } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const INVITE_TIERS = [
  { name: 'Bronze', min: 3, max: 5 },
  { name: 'Silver', min: 6, max: 10 },
  { name: 'Gold', min: 11, max: 30 },
  { name: 'Diamond', min: 31, max: 60 },
  { name: 'Emerald', min: 61, max: Infinity },
];

export default async (req) => {
  const user = getSessionUser(req);
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Dados do membro (cache)
  const { data: member } = await supabase
    .from('guild_cache')
    .select('*')
    .eq('discord_id', user.discord_id)
    .single();

  // Histórico de moderação pessoal
  const { data: logs } = await supabase
    .from('mod_logs')
    .select('*')
    .eq('target_discord_id', user.discord_id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Avisos ativos
  const { data: warnings } = await supabase
    .from('warnings')
    .select('*')
    .eq('discord_id', user.discord_id)
    .eq('active', true);

  // Roles do servidor (para mostrar nomes/cores)
  const rolesRes = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/roles`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );
  const guildRoles = rolesRes.ok ? await rolesRes.json() : [];
  const roleMap = {};
  guildRoles.forEach(r => { roleMap[r.id] = { name: r.name, color: r.color }; });

  const myRoles = (member?.roles || [])
    .map(id => roleMap[id])
    .filter(Boolean);

  // Tempo como membro
  const joinedAt = member?.joined_at;
  let daysAsMember = null;
  if (joinedAt) {
    daysAsMember = Math.floor((Date.now() - new Date(joinedAt).getTime()) / (1000 * 60 * 60 * 24));
  }

  // Progresso de convites - usa um campo "invites_count" se existir na tua tabela users, senão 0
  const { data: userRow } = await supabase
    .from('users')
    .select('invites_count')
    .eq('discord_id', user.discord_id)
    .single();

  const invitesCount = userRow?.invites_count || 0;

  let currentTier = null;
  let nextTier = INVITE_TIERS[0];
  for (const tier of INVITE_TIERS) {
    if (invitesCount >= tier.min) currentTier = tier;
    if (invitesCount < tier.min) {
      nextTier = tier;
      break;
    }
  }
  if (currentTier && currentTier.max === Infinity) nextTier = null;

  return Response.json({
    profile: {
      discord_id: user.discord_id,
      username: user.username,
      avatar_url: user.avatar_url,
      dashboard_role: user.dashboard_role,
      joined_at: joinedAt,
      days_as_member: daysAsMember,
      roles: myRoles,
    },
    invites: {
      count: invitesCount,
      current_tier: currentTier?.name || null,
      next_tier: nextTier ? { name: nextTier.name, needed: nextTier.min } : null,
    },
    moderation: {
      logs: logs || [],
      active_warnings: warnings?.length || 0,
    },
  });
};