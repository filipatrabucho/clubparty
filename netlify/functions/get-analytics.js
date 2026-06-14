import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  // 1. Novos membros por semana (últimas 8 semanas, baseado em joined_at do guild_cache)
  const { data: members } = await supabase
    .from('guild_cache')
    .select('joined_at')
    .not('joined_at', 'is', null);

  const weeklyJoins = {};
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const key = weekStart.toISOString().slice(0, 10);
    weeklyJoins[key] = 0;
  }

  (members || []).forEach(m => {
    const joined = new Date(m.joined_at);
    const weekStart = new Date(joined);
    weekStart.setDate(joined.getDate() - joined.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const key = weekStart.toISOString().slice(0, 10);
    if (key in weeklyJoins) weeklyJoins[key]++;
  });

  const newMembersData = Object.entries(weeklyJoins).map(([date, count]) => ({
    week: new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }),
    novos: count,
  }));

  // 2. Ações de moderação por tipo (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: logs } = await supabase
    .from('mod_logs')
    .select('action, source, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const ACTION_LABELS = {
    ban: 'Bans',
    kick: 'Kicks',
    timeout: 'Timeouts',
    warn: 'Avisos',
    unban: 'Unbans',
    role_add: 'Cargos adicionados',
    role_remove: 'Cargos removidos',
  };

  const actionCounts = {};
  (logs || []).forEach(log => {
    const label = ACTION_LABELS[log.action] || log.action;
    actionCounts[label] = (actionCounts[label] || 0) + 1;
  });

 const REVERSE_ACTION_LABELS = Object.fromEntries(
    Object.entries(ACTION_LABELS).map(([key, label]) => [label, key])
  );

  const actionsData = Object.entries(actionCounts).map(([name, value]) => ({
    name,
    value,
    actionKey: REVERSE_ACTION_LABELS[name],
  }));
  
  // 3. Ações manuais vs automáticas
  const sourceCounts = { manual: 0, automod: 0 };
  (logs || []).forEach(log => {
    sourceCounts[log.source] = (sourceCounts[log.source] || 0) + 1;
  });

  // 4. Totais gerais
  const { count: totalMembers } = await supabase
    .from('guild_cache')
    .select('*', { count: 'exact', head: true })
    .eq('is_member', true);

  const { count: totalBans } = await supabase
    .from('mod_logs')
    .select('*', { count: 'exact', head: true })
    .eq('action', 'ban');

  const { count: activeWarnings } = await supabase
    .from('warnings')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  return Response.json({
    newMembersData,
    actionsData,
    sourceData: [
      { name: 'Manual', value: sourceCounts.manual || 0 },
      { name: 'Automático', value: sourceCounts.automod || 0 },
    ],
    totals: {
      totalMembers: totalMembers || 0,
      totalBans: totalBans || 0,
      activeWarnings: activeWarnings || 0,
      actionsLast30Days: (logs || []).length,
    },
  });
};