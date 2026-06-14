import { useState } from 'react';

export default function Support() {
  const [form, setForm] = useState({ name: '', discord_username: '', email: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const res = await fetch('/.netlify/functions/send-support-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setStatus('success');
      setForm({ name: '', discord_username: '', email: '', comment: '' });
    } else {
      setStatus('error');
    }
    setSubmitting(false);
  }

  return (
  <div className="support-page">
    <div className="support-container">
      <h1>SUPPORT</h1>
      <p className="support-intro">
        Tens alguma questão, problema ou sugestão? Preenche o formulário abaixo e a nossa equipa entrará em contacto.
      </p>

      <form className="support-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className="filter-input"
            type="text"
            placeholder="Nome"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <input
            className="filter-input"
            type="text"
            placeholder="Discord Username"
            value={form.discord_username}
            onChange={e => setForm(f => ({ ...f, discord_username: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <input
            className="filter-input"
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <textarea
            className="filter-input"
            placeholder="Comment"
            rows={5}
            required
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          />
        </div>

        {status === 'success' && <p className="form-success">Mensagem enviada com sucesso! Obrigado.</p>}
        {status === 'error' && <p className="form-error">Erro ao enviar. Tenta novamente.</p>}

        <button className="button" type="submit" disabled={submitting}>
          {submitting ? 'A enviar...' : 'Enviar'}
        </button>
      </form>
    </div>
  </div>
);
}