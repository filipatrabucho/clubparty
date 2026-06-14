import { createClient } from '@supabase/supabase-js';
import { getSessionUser } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const STAFF_ROLES = ['helper', 'mod', 'admin'];

export default async (req) => {
  const user = getSessionUser(req);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { ticket_id, content } = await req.json();
  if (!ticket_id || !content?.trim()) return new Response('Dados incompletos', { status: 400 });

  const { data: ticket, error } = await supabase.from('tickets').select('*').eq('id', ticket_id).single();
  if (error || !ticket) return new Response('Ticket não encontrado', { status: 404 });

  const isOwner = ticket.author_discord_id === user.discord_id;
  const isStaff = STAFF_ROLES.includes(user.dashboard_role);
  if (!isOwner && !isStaff) return new Response('Forbidden', { status: 403 });

  await supabase.from('ticket_messages').insert({
    ticket_id,
    author_discord_id: user.discord_id,
    author_username: user.username,
    content: content.trim(),
    is_staff: isStaff,
  });

  // Reabre o ticket se estava resolvido e o autor respondeu de novo
  if (!isStaff && ['resolved', 'closed'].includes(ticket.status)) {
    await supabase.from('tickets').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', ticket_id);
  } else {
    await supabase.from('tickets').update({ updated_at: new Date().toISOString() }).eq('id', ticket_id);
  }

  return Response.json({ success: true });
};