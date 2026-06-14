export default async (req) => {
  const { name, discord_username, email, comment } = await req.json();

  if (!name?.trim() || !email?.trim() || !comment?.trim()) {
    return new Response('Preenche todos os campos obrigatórios', { status: 400 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Club Party <onboarding@resend.dev>', // ou domínio verificado
      to: 'clubpartyserver@gmail.com',
      reply_to: email,
      subject: `Novo pedido de suporte - ${name}`,
      html: `
        <h2>Novo pedido de suporte</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Discord:</strong> ${discord_username || '-'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${comment.replace(/\n/g, '<br>')}</p>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Erro Resend:', err);
    return new Response('Erro ao enviar email', { status: 500 });
  }

  return Response.json({ success: true });
};