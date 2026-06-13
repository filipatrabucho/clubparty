import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  // Lê do cache local (mais rápido, evita rate limits do Discord)
  const { data, error } = await supabase
    .from('guild_cache')
    .select('*')
    .eq('is_member', true)
    .order('username');

  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ members: data });
};