import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user, ['mod', 'admin']);
  if (forbidden) return forbidden;

  const { id } = await req.json();
  if (!id) return new Response('id é obrigatório', { status: 400 });

  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ success: true });
};