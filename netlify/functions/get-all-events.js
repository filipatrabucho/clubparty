import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })
    .limit(50);

  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ events: events || [] });
};