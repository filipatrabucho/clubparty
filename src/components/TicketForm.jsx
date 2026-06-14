import { useState } from 'react';

const TICKET_TYPES = [
  { value: 'support', label: '🛠️ Suporte Geral' },
  { value: 'report', label: '🚩 Denúncia de Membro' },
  { value: 'application', label: '📋 Candidatura à Staff' },
  { value: 'unban', label: '🔓 Recurso de Ban' },
  { value: 'shop', label: '🛍️ Suporte da Loja' },
];

export default function TicketForm({ onCreated }) {
  const [type, setType] = useState('support');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!subject.trim() || !description.trim()) {
      setError('Preenche o assunto e a descrição.');
      return;
    }

    setSubmitting(true);
    const res = await fetch('/.netlify/functions/create-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, subject, description }),
    });

    if (res.ok) {
      setSubject('');
      setDescription('');
      setType('support');
      onCreated?.();
    } else {
      setError('Erro ao criar o ticket. Tenta novamente.');
    }
    setSubmitting(false);
  }

  return (
    <form className="chart-card" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Tipo de pedido</label>
        <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>
          {TICKET_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Assunto</label>
        <input
          className="filter-input"
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Resumo curto do pedido"
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label>Descrição</label>
        <textarea
          className="filter-input"
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Explica com detalhe o que precisas..."
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <button className="button" type="submit" disabled={submitting}>
        {submitting ? 'A enviar...' : 'Enviar Ticket'}
      </button>
    </form>
  );
}