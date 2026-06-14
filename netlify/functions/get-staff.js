import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async () => {
  const { data, error } = await supabase
    .from('users')
    .select('discord_id, username, global_name, avatar_url, dashboard_role')
    .in('dashboard_role', ['admin', 'mod'])
    .order('dashboard_role', { ascending: true }); // admin antes de mod (ordem alfabética inversa funciona aqui)

  if (error) return Response.json({ staff: [] });

  return Response.json({ staff: data });
};