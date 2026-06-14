import { createClient } from '@supabase/supabase-js';
import { getSessionUser, requireRole } from './_utils/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

export default async (req) => {
  const user = getSessionUser(req);
  const forbidden = requireRole(user);
  if (forbidden) return forbidden;

  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/invites`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );

  if (!res.ok) return new Response('Erro ao buscar convites', { status: 500 });

  const invites = await res.json();

  // Agrupa usos por inviter
  const inviteCounts = {};
  invites.forEach(inv => {
    if (!inv.inviter) return;
    const inviterId = inv.inviter.id;
    inviteCounts[inviterId] = (inviteCounts[inviterId] || 0) + (inv.uses || 0);
  });

  // Atualiza cada user com a contagem
  const updates = Object.entries(inviteCounts).map(([discord_id, count]) =>
    supabase.from('users').update({ invites_count: count }).eq('discord_id', discord_id)
  );

  await Promise.all(updates);

  // Reseta para 0 quem não tem convites ativos (opcional, mantém dados consistentes)
  const activeInviterIds = Object.keys(inviteCounts);
  if (activeInviterIds.length > 0) {
    await supabase
      .from('users')
      .update({ invites_count: 0 })
      .not('discord_id', 'in', `(${activeInviterIds.join(',')})`);
  }

  return Response.json({ synced: activeInviterIds.length, total_invites: invites.length });
};