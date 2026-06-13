import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const { discord_id, reason } = await req.json();
  if (!discord_id || !reason) return new Response('Missing fields', { status: 400 });

  // 1. Regista o log de moderação
  const { data: log, error: logError } = await supabase
    .from('mod_logs')
    .insert({
      target_discord_id: discord_id,
      moderator_discord_id: user.discord_id,
      action: 'warn',
      reason,
      source: 'manual',
    })
    .select()
    .single();

  if (logError) return new Response(logError.message, { status: 500 });

  // 2. Regista o aviso
  const { error: warnError } = await supabase
    .from('warnings')
    .insert({
      discord_id,
      reason,
      issued_by: user.discord_id,
      mod_log_id: log.id,
      active: true,
    });

  if (warnError) return new Response(warnError.message, { status: 500 });

  // 3. Conta avisos ativos
  const { count } = await supabase
    .from('warnings')
    .select('*', { count: 'exact', head: true })
    .eq('discord_id', discord_id)
    .eq('active', true);

  return Response.json({ success: true, active_warnings: count });
};