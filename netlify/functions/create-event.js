import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user, ['mod', 'admin']);
  if (forbidden) return forbidden;

  const { title, description, emoji, event_date, event_time } = await req.json();

  if (!title || !event_date) {
    return new Response('title e event_date são obrigatórios', { status: 400 });
  }

  const { data, error } = await supabase.from('events').insert({
    title,
    description,
    emoji: emoji || '🎉',
    event_date,
    event_time,
    created_by: user.discord_id,
  }).select().single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ event: data });
};