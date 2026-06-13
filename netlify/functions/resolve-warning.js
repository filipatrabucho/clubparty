import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const { warning_id } = await req.json();
  if (!warning_id) return new Response('Missing warning_id', { status: 400 });

  const { error } = await supabase
    .from('warnings')
    .update({ active: false })
    .eq('id', warning_id);

  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ success: true });
};