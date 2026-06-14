import { createClient } from '@supabase/supabase-js';
import { getSessionUser } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('author_discord_id', user.discord_id)
    .order('created_at', { ascending: false });

  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ tickets: tickets || [] });
};