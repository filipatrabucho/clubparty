import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ACTION_LABELS = {
  ban: { label: 'Banido', icon: '🔨', className: 'log-ban' },
  unban: { label: 'Desbanido', icon: '🔓', className: 'log-unban' },
  kick: { label: 'Expulso', icon: '👢', className: 'log-kick' },
  timeout: { label: 'Castigado', icon: '⏱', className: 'log-timeout' },
  warn: { label: 'Avisado', icon: '⚠️', className: 'log-warn' },
  role_add: { label: 'Cargo adicionado', icon: '➕', className: 'log-role' },
  role_remove: { label: 'Cargo removido', icon: '➖', className: 'log-role' },
};

export default function MemberProfile() {
  const { discordId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/.netlify/functions/get-member-history?discord_id=${discordId}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [discordId]);

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  if (loading) return <div className="dashboard"><p className="table-empty">A carregar...</p></div>;
  if (!data?.member) return <div className="dashboard"><p className="table-empty">Membro não encontrado.</p></div>;

  const { member, logs, warnings } = data;
  const activeWarnings = warnings.filter(w => w.active);

  return (
    <div className="dashboard">
      <Link to="/dashboard" className="back-link">← Voltar ao Dashboard</Link>

      <div className="profile-header">
        {member.avatar_url
          ? <img src={member.avatar_url} alt="" className="profile-avatar" />
          : <div className="avatar avatar-placeholder profile-avatar" />}
        <div>
          <h1>{member.username}</h1>
          <p className="dashboard-welcome">
            Membro desde {formatDate(member.joined_at)}
            {!member.is_member && <span className="status-badge status-failed" style={{ marginLeft: '0.6rem' }}>Saiu do servidor</span>}
          </p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="stat-number">{logs.length}</span>
          <span className="stat-label">Ações no histórico</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-number" style={{ color: activeWarnings.length > 0 ? '#fbbf24' : undefined }}>
            {activeWarnings.length}
          </span>
          <span className="stat-label">Avisos ativos</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-number">{logs.filter(l => l.action === 'ban').length}</span>
          <span className="stat-label">Bans</span>
        </div>
      </div>

      <h2 className="section-title">Histórico de atividade</h2>

      {logs.length === 0 ? (
        <p className="table-empty">Sem registos para este membro.</p>
      ) : (
        <div className="timeline">
          {logs.map(log => {
            const meta = ACTION_LABELS[log.action] || { label: log.action, icon: '•', className: '' };
            return (
              <div key={log.id} className={`timeline-item ${meta.className}`}>
                <div className="timeline-icon">{meta.icon}</div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <strong>{meta.label}</strong>
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