import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (event) => {
  const url = new URL(event.url);
  const homepageOnly = url.searchParams.get('homepage') === 'true';

  let query = supabase
    .from('posts')
    .select('id, title, content, image_url, image_bg_color, link_url, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (homepageOnly) {
    query = query.eq('show_on_homepage', true).limit(6);
  } else {
    query = query.not('image_url', 'is', null).limit(4);
  }

  const { data, error } = await query;

  if (error) {
    console.error('get-recent-posts error:', error);
    return Response.json({ posts: [] });
  }

  return Response.json({ posts: data || [] });
};