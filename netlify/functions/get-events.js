import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async () => {
  const today = new Date().toISOString().slice(0, 10);

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(6);

  if (error) return Response.json({ events: [] });

  return Response.json({ events: events || [] });
};