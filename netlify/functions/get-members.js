import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const { data: members, error } = await supabase
    .from('guild_cache')
    .select('*')
    .eq('is_member', true)
    .order('username');

  if (error) return new Response(error.message, { status: 500 });

  // Busca contagens de avisos ativos
  const { data: warnings } = await supabase
    .from('warnings')
    .select('discord_id')
    .eq('active', true);

  const warningCounts = {};
  (warnings || []).forEach(w => {
    warningCounts[w.discord_id] = (warningCounts[w.discord_id] || 0) + 1;
  });

  const enriched = members.map(m => ({
    ...m,
    active_warnings: warningCounts[m.discord_id] || 0,
  }));

  return Response.json({ members: enriched });
};