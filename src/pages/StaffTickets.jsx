import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import DashboardNav from '../components/DashboardNav';

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

const TYPE_FILTERS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'support', label: 'Suporte Geral' },
  { value: 'report', label: 'Denúncia' },
  { value: 'application', label: 'Candidatura à Staff' },
  { value: 'unban', label: 'Recurso de Ban' },
  { value: 'shop', label: 'Suporte da Loja' },
];

const STATUS_FILTERS = [
  { value: '', label: 'Todos os estados' },
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em Progresso' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
];

export default function StaffTickets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const type = searchParams.get('type') || '';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    loadTickets();
  }, [status, type]);

  async function loadTickets() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (type) params.set('type', type);

    const res = await fetch(`/.netlify/functions/get-all-tickets?${params.toString()}`);
    const data = await res.json();
    setTickets(data.tickets || []);
    setLoading(false);
  }

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  if (selectedTicket) {
    return (
      <StaffTicketDetail
        ticketId={selectedTicket}
        onBack={() => { setSelectedTicket(null); loadTickets(); }}
      />
    );
  }

  return (
    <div className="dashboard">
      <DashboardNav />

      <div className="dashboard-header">
        <div>
          <h1>Tickets</h1>
          <p className="dashboard-welcome">Pedidos de suporte, denúncias e outros contactos de membros</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="stat-number">{tickets.length}</span>
          <span className="stat-label">Resultados</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-number">{tickets.filter(t => t.status === 'open').length}</span>
          <span className="stat-label">Abertos</span>
        </div>
      </div>

      <div className="dashboard-filters">
        <select className="filter-select" value={type} onChange={e => updateFilter('type', e.target.value)}>
          {TYPE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <select className="filter-select" value={status} onChange={e => updateFilter('status', e.target.value)}>
          {STATUS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {(status || type) && (
          <button className="filter-clear" onClick={() => setSearchParams({})}>
            ✕ Limpar filtros
          </button>
        )}
      </div>

      {loading ? (
        <p className="table-empty">A carregar...</p>
      ) : tickets.length === 0 ? (
        <p className="table-empty">Sem tickets para este filtro.</p>
      ) : (
        <div className="timeline">
          {tickets.map(ticket => {
            const statusMeta = STATUS_LABELS[ticket.status] || { label: ticket.status, className: '' };
            return (
              <div key={ticket.id} className="timeline-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedTicket(ticket.id)}>
                <div className="timeline-icon">{TICKET_TYPE_LABELS[ticket.type]?.split(' ')[0] || '🎫'}</div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <strong>{ticket.subject} — {ticket.author_username}</strong>
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

function StaffTicketDetail({ ticketId, onBack }) {
  const { user } = useAuth();
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

  async function handleStatusChange(newStatus) {
    const res = await fetch('/.netlify/functions/update-ticket-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: ticketId, status: newStatus }),
    });

    if (res.ok) await loadTicket();
    else alert('Erro ao atualizar estado');
  }

  async function handleAssignToMe() {
    const res = await fetch('/.netlify/functions/update-ticket-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: ticketId, assign_to_me: true }),
    });

    if (res.ok) await loadTicket();
    else alert('Erro ao atribuir ticket');
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
            ← Voltar aos tickets
          </button>
          <h1>{ticket.subject}</h1>
            <div className="ticket-info-line">
                {TICKET_TYPE_LABELS[ticket.type]}
                <span>·</span>
                Aberto por{' '}
                <Link to={`/dashboard/member/${ticket.author_discord_id}`} className="member-link">
                    {ticket.author_username}
                </Link>
                <span>·</span>
                <span className={`status-badge ${statusMeta.className}`}>{statusMeta.label}</span>
            </div>
        </div>
        <div className="dashboard-actions">
          {!ticket.assigned_to && (
            <button className="button-sm" onClick={handleAssignToMe}>
              🙋 Atribuir a mim
            </button>
          )}
          <select
            className="filter-select"
            value={ticket.status}
            onChange={e => handleStatusChange(e.target.value)}
          >
            {STATUS_FILTERS.filter(f => f.value).map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

    {ticket.assigned_to && (
        <div className="ticket-assigned">
            🙋 Atribuído a: {ticket.assigned_to === user?.discord_id ? 'ti' : ticket.assigned_to}
        </div>
    )}

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
              placeholder="Escreve a resposta para o membro..."
            />
          </div>
          <button className="button" type="submit" disabled={sending} style={{ marginTop: '0.5rem' }}>
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