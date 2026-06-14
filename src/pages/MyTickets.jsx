import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TicketForm from '../components/TicketForm';

const TICKET_TYPE_LABELS = {
  support: '🛠️ Suporte Geral',
  report: '🚩 Denúncia',
  application: '📋 Candidatura à Staff',
  unban: '🔓 Recurso de Ban',
  shop: '🛍️ Suporte da Loja',
};

const STATUS_LABELS = {
  open: { label: 'Aberto', className: 'status-pending' },
  in_progress: { label: 'Em Progresso', className: 'status-pending' },
  resolved: { label: 'Resolvido', className: 'status-success' },
  closed: { label: 'Fechado', className: 'status-failed' },
};

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    const res = await fetch('/.netlify/functions/get-my-tickets');
    const data = await res.json();
    setTickets(data.tickets || []);
    setLoading(false);
  }

  function handleCreated() {
    setShowForm(false);
    loadTickets();
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  if (selectedTicket) {
    return (
      <TicketDetail
        ticketId={selectedTicket}
        onBack={() => { setSelectedTicket(null); loadTickets(); }}
      />
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <Link to="/perfil" className="back-link">← Voltar ao perfil</Link>
          <h1>Os Meus Tickets</h1>
          <p className="dashboard-welcome">Pedidos de suporte, denúncias e outros contactos com a staff</p>
        </div>
        <div className="dashboard-actions">
          <button className="button" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancelar' : '+ Novo Ticket'}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ marginBottom: '2rem' }}>
          <TicketForm onCreated={handleCreated} />
        </div>
      )}

      {loading ? (
        <p className="table-empty">A carregar...</p>
      ) : tickets.length === 0 ? (
        <p className="table-empty">Ainda não abriste nenhum ticket.</p>
      ) : (
        <div className="timeline">
          {tickets.map(ticket => {
            const statusMeta = STATUS_LABELS[ticket.status] || { label: ticket.status, className: '' };
            return (
              <div key={ticket.id} className="timeline-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedTicket(ticket.id)}>
                <div className="timeline-icon">{TICKET_TYPE_LABELS[ticket.type]?.split(' ')[0] || '🎫'}</div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <strong>{ticket.subject}</strong>
                    <span className="text-muted">{formatDate(ticket.created_at)}</span>
                  </div>
                  <p className="timeline-reason">{TICKET_TYPE_LABELS[ticket.type]}</p>
                  <span className={`status-badge ${statusMeta.className}`}>{statusMeta.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TicketDetail({ ticketId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  async function loadTicket() {
    setLoading(true);
    const res = await fetch(`/.netlify/functions/get-ticket?id=${ticketId}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;

    setSending(true);
    const res = await fetch('/.netlify/functions/reply-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: ticketId, content: reply }),
    });

    if (res.ok) {
      setReply('');
      await loadTicket();
    } else {
      alert('Erro ao enviar resposta');
    }
    setSending(false);
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  if (loading) return <div className="dashboard"><p className="table-empty">A carregar...</p></div>;
  if (!data?.ticket) return <div className="dashboard"><p className="table-empty">Ticket não encontrado.</p></div>;

  const { ticket, messages } = data;
  const statusMeta = STATUS_LABELS[ticket.status] || { label: ticket.status, className: '' };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <button className="back-link" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            ← Voltar aos meus tickets
          </button>
          <h1>{ticket.subject}</h1>
          <p className="dashboard-welcome">
            {TICKET_TYPE_LABELS[ticket.type]} · <span className={`status-badge ${statusMeta.className}`}>{statusMeta.label}</span>
          </p>
        </div>
      </div>

      <div className="ticket-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`ticket-message ${msg.is_staff ? 'ticket-message-staff' : 'ticket-message-own'}`}>
            <div className="ticket-message-header">
              <strong>{msg.is_staff ? `👮 ${msg.author_username} (Staff)` : msg.author_username}</strong>
              <span className="text-muted">{formatDate(msg.created_at)}</span>
            </div>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      {ticket.status !== 'closed' && (
        <form className="chart-card" style={{ marginTop: '1.5rem' }} onSubmit={handleReply}>
          <div className="form-group">
            <label>Responder</label>
            <textarea
              className="filter-input"
              rows={3}
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Escreve a tua resposta..."
            />
          </div>
          <button className="button" type="submit" disabled={sending}>
            {sending ? 'A enviar...' : 'Enviar Resposta'}
          </button>
        </form>
      )}

      {ticket.status === 'closed' && (
        <p className="table-empty" style={{ marginTop: '1.5rem' }}>Este ticket está fechado.</p>
      )}
    </div>
  );
}