import { createClient } from '@supabase/supabase-js';
import { getSessionUser } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const STAFF_ROLES = ['helper', 'mod', 'admin'];

export default async (req) => {
  const user = getSessionUser(req);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return new Response('id é obrigatório', { status: 400 });

  const { data: ticket, error } = await supabase.from('tickets').select('*').eq('id', id).single();
  if (error || !ticket) return new Response('Ticket não encontrado', { status: 404 });

  const isOwner = ticket.author_discord_id === user.discord_id;
  const isStaff = STAFF_ROLES.includes(user.dashboard_role);
  if (!isOwner && !isStaff) return new Response('Forbidden', { status: 403 });

  const { data: messages } = await supabase
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  return Response.json({ ticket, messages: messages || [], is_staff_view: isStaff });
};