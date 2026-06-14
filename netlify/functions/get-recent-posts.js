import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, content, image_url, published_at')
    .eq('status', 'published')
    .not('image_url', 'is', null)
    .order('published_at', { ascending: false })
    .limit(4);

  if (error) return Response.json({ posts: [] });

  return Response.json({ posts: data });
};