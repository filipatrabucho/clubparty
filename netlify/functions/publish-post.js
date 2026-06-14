import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user, ['mod', 'admin']);
  if (forbidden) return forbidden;

  const { title, content, image_url, target_channel_id } = await req.json();

  if (!title || !content || !target_channel_id) {
    return new Response('Campos obrigatórios em falta', { status: 400 });
  }

  // 1. Cria o registo como 'draft'
  const { data: post, error: insertError } = await supabase
    .from('posts')
    .insert({
      title,
      content,
      image_url,
      author_discord_id: user.discord_id,
      target_channel_id,
      status: 'draft',
    })
    .select()
    .single();

  if (insertError) return new Response(insertError.message, { status: 500 });

  // 2. Monta o embed para o Discord
  const embed = {
    title,
    description: content,
    color: 0xD65A7E, // a tua cor de marca, em hexadecimal -> decimal
    ...(image_url ? { image: { url: image_url } } : {}),
    footer: { text: 'Club Party' },
    timestamp: new Date().toISOString(),
  };

  // 3. Envia para o canal do Discord
  const res = await fetch(
    `https://discord.com/api/channels/${target_channel_id}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embeds: [embed] }),
    }
  );

  if (!res.ok) {
    await supabase.from('posts').update({ status: 'failed' }).eq('id', post.id);
    const errData = await res.json();
    return Response.json({ success: false, error: errData }, { status: 500 });
  }

  const message = await res.json();

  // 4. Atualiza o registo com sucesso
  await supabase
    .from('posts')
    .update({
      status: 'published',
      discord_message_id: message.id,
      published_at: new Date().toISOString(),
    })
    .eq('id', post.id);

  return Response.json({ success: true, post_id: post.id });
};