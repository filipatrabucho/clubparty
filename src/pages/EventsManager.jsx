import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav';

const EMOJI_OPTIONS = ['🎉', '🎮', '🎙️', '🏆', '🎵', '🎬', '🎲', '🎂'];

export default function EventsManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', emoji: '🎉', event_date: '', event_time: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    const res = await fetch('/.netlify/functions/get-all-events');
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch('/.netlify/functions/create-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ title: '', description: '', emoji: '🎉', event_date: '', event_time: '' });
      setShowForm(false);
      await loadEvents();
    } else {
      alert('Erro ao criar evento');
    }
    setSubmitting(false);
  }

  async function handleDelete(id) {
    if (!confirm('Apagar este evento?')) return;

    const res = await fetch('/.netlify/functions/delete-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) setEvents(prev => prev.filter(e => e.id !== id));
    else alert('Erro ao apagar evento');
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'short',
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="dashboard">
      <DashboardNav />

      <div className="dashboard-header">
        <div>
          <h1>Eventos</h1>
          <p className="dashboard-welcome">Gere os próximos eventos mostrados na página inicial</p>
        </div>
        <div className="dashboard-actions">
          <button className="button" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancelar' : '+ Novo Evento'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="chart-card" style={{ marginBottom: '2rem' }} onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Emoji</label>
              <select
                className="filter-select"
                value={form.emoji}
                onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
              >
                {EMOJI_OPTIONS.map(emoji => (
                  <option key={emoji} value={emoji}>{emoji}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Título</label>
              <input
                className="filter-input"
                type="text"
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Festa de Verão"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              className="filter-input"
              rows={2}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Breve descrição do evento"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data</label>
              <input
                className="filter-input"
                type="date"
                required
                value={form.event_date}
                onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Hora (texto livre)</label>
              <input
                className="filter-input"
                type="text"
                value={form.event_time}
                onChange={e => setForm(f => ({ ...f, event_time: e.target.value }))}
                placeholder="Ex: Sábado, 22h00"
              />
            </div>
          </div>

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'A criar...' : 'Criar Evento'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="table-empty">A carregar...</p>
      ) : events.length === 0 ? (
        <p className="table-empty">Sem eventos criados ainda.</p>
      ) : (
        <div className="timeline">
          {events.map(event => {
            const isPast = event.event_date < today;
            return (
              <div key={event.id} className={`timeline-item ${isPast ? 'log-role' : ''}`}>
                <div className="timeline-icon">{event.emoji}</div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <strong>{event.title}</strong>
                    <span className="text-muted">{formatDate(event.event_date)}</span>
                  </div>
                  {event.description && <p className="timeline-reason">{event.description}</p>}
                  <div className="timeline-meta">
                    {event.event_time && <span className="text-muted">⏰ {event.event_time}</span>}
                    {isPast && <span className="status-badge status-failed">Já passou</span>}
                  </div>
                  <button
                    className="button-sm button-danger"
                    style={{ marginTop: '0.6rem' }}
                    onClick={() => handleDelete(event.id)}
                  >
                    🗑️ Apagar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}