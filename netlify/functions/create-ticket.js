import { createClient } from '@supabase/supabase-js';
import { getSessionUser } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const VALID_TYPES = ['support', 'report', 'application', 'unban', 'shop'];

export default async (req) => {
  const user = getSessionUser(req);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { type, subject, description } = await req.json();

  if (!VALID_TYPES.includes(type)) return new Response('Tipo inválido', { status: 400 });
  if (!subject?.trim() || !description?.trim()) {
    return new Response('Assunto e descrição são obrigatórios', { status: 400 });
  }

  const { data: ticket, error } = await supabase.from('tickets').insert({
    type,
    subject: subject.trim(),
    author_discord_id: user.discord_id,
    author_username: user.username,
  }).select().single();

  if (error) return new Response(error.message, { status: 500 });

  // Primeira mensagem = descrição inicial
  await supabase.from('ticket_messages').insert({
    ticket_id: ticket.id,
    author_discord_id: user.discord_id,
    author_username: user.username,
    content: description.trim(),
    is_staff: false,
  });

  return Response.json({ ticket });
};