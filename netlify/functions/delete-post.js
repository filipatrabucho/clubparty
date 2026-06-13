import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const { post_id } = await req.json();
  if (!post_id) return new Response('Missing post_id', { status: 400 });

  const { data: post } = await supabase.from('posts').select('*').eq('id', post_id).single();
  if (!post) return new Response('Post não encontrado', { status: 404 });

  // Tenta apagar a mensagem do Discord (se existir)
  if (post.discord_message_id) {
    await fetch(
      `https://discord.com/api/channels/${post.target_channel_id}/messages/${post.discord_message_id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      }
    );
  }

  await supabase.from('posts').delete().eq('id', post_id);

  return Response.json({ success: true });
};