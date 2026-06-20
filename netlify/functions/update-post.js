import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (event) => {
  if (event.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await event.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { post_id, show_on_homepage } = body;

  if (!post_id || show_on_homepage === undefined) {
    return Response.json({ error: 'post_id e show_on_homepage são obrigatórios' }, { status: 400 });
  }

  const { error } = await supabase
    .from('posts')
    .update({ show_on_homepage })
    .eq('id', post_id);

  if (error) {
    console.error('update-post error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
};