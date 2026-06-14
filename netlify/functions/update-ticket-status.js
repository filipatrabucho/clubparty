import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const { ticket_id, status, assign_to_me } = await req.json();
  if (!ticket_id) return new Response('ticket_id é obrigatório', { status: 400 });

  const updates = { updated_at: new Date().toISOString() };
  if (status) {
    if (!VALID_STATUSES.includes(status)) return new Response('Status inválido', { status: 400 });
    updates.status = status;
  }
  if (assign_to_me) updates.assigned_to = user.discord_id;

  const { error } = await supabase.from('tickets').update(updates).eq('id', ticket_id);
  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ success: true });
};