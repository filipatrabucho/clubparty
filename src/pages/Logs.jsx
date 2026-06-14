import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const ACTION_LABELS = {
  ban: { label: 'Banido', icon: '🔨', className: 'log-ban' },
  unban: { label: 'Desbanido', icon: '🔓', className: 'log-unban' },
  kick: { label: 'Expulso', icon: '👢', className: 'log-kick' },
  timeout: { label: 'Castigado', icon: '⏱', className: 'log-timeout' },
  warn: { label: 'Avisado', icon: '⚠️', className: 'log-warn' },
  role_add: { label: 'Cargo adicionado', icon: '➕', className: 'log-role' },
  role_remove: { label: 'Cargo removido', icon: '➖', className: 'log-role' },
};

const ACTION_FILTERS = [
  { value: '', label: 'Todas as ações' },
  { value: 'ban', label: 'Bans' },
  { value: 'kick', label: 'Kicks' },
  { value: 'timeout', label: 'Timeouts' },
  { value: 'warn', label: 'Avisos' },
  { value: 'unban', label: 'Unbans' },
  { value: 'role_add', label: 'Cargos adicionados' },
  { value: 'role_remove', label: 'Cargos removidos' },
];

export default function Logs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const action = searchParams.get('action') || '';
  const source = searchParams.get('source') || '';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (source) params.set('source', source);

    fetch(`/.netlify/functions/get-logs?${params.toString()}`)
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .finally(() => setLoading(false));
  }, [action, source]);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <Link to="/dashboard" className="back-link">← Voltar ao Dashboard</Link>
          <h1>Logs de Moderação</h1>
          <p className="dashboard-welcome">Histórico completo de ações no servidor</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="stat-number">{logs.length}</span>
          <span className="stat-label">Resultados</span>
        </div>
      </div>

      <div className="dashboard-filters">
        <select
          className="filter-select"
          value={action}
          onChange={e => updateFilter('action', e.target.value)}
        >
          {ACTION_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={source}
          onChange={e => updateFilter('source', e.target.value)}
        >
          <option value="">Manual e Automático</option>
          <option value="manual">Apenas Manual</option>
          <option value="automod">Apenas Automático</option>
        </select>

        {(action || source) && (
          <button className="filter-clear" onClick={() => setSearchParams({})}>
            ✕ Limpar filtros
          </button>
        )}
      </div>

      {loading ? (
        <p className="table-empty">A carregar...</p>
      ) : logs.length === 0 ? (
        <p className="table-empty">Sem registos para este filtro.</p>
      ) : (
        <div className="timeline">
          {logs.map(log => {
            const meta = ACTION_LABELS[log.action] || { label: log.action, icon: '•', className: '' };
            return (
              <div key={log.id} className={`timeline-item ${meta.className}`}>
                <div className="timeline-icon">{meta.icon}</div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <strong>
                      {meta.label} —{' '}
                      <Link to={`/dashboard/member/${log.target_discord_id}`} className="member-link">
                        {log.target_username}
                      </Link>
                    </strong>
                    <span className="text-muted">{formatDate(log.created_at)}</span>
                  </div>
                  {log.reason && <p className="timeline-reason">{log.reason}</p>}
                  <div className="timeline-meta">
                    {log.source === 'automod' ? (
                      <span className="status-badge status-failed">🤖 Automático</span>
                    ) : (
                      <span className="text-muted">Por: {log.moderator_name || '—'}</span>
                    )}
                    {log.duration_minutes && (
                      <span className="text-muted"> • Duração: {log.duration_minutes} min</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}