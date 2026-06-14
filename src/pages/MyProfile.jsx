import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

const ACTION_LABELS = {
  ban: { label: 'Banido', icon: '🔨', className: 'log-ban' },
  unban: { label: 'Desbanido', icon: '🔓', className: 'log-unban' },
  kick: { label: 'Expulso', icon: '👢', className: 'log-kick' },
  timeout: { label: 'Castigado', icon: '⏱', className: 'log-timeout' },
  warn: { label: 'Avisado', icon: '⚠️', className: 'log-warn' },
  role_add: { label: 'Cargo adicionado', icon: '➕', className: 'log-role' },
  role_remove: { label: 'Cargo removido', icon: '➖', className: 'log-role' },
};

const SHOP_URL = import.meta.env.VITE_FOURTHWALL_SHOP_URL;
const GUILD_INVITE_URL = 'https://discord.gg/o-teu-invite';

export default function MyProfile() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/.netlify/functions/get-my-profile')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  if (loading) return <div className="dashboard"><p className="table-empty">A carregar...</p></div>;
  if (!data) return <div className="dashboard"><p className="table-empty">Erro ao carregar perfil.</p></div>;

  const { profile, invites, moderation } = data;

  const progressPercent = invites.next_tier
    ? Math.min(100, (invites.count / invites.next_tier.needed) * 100)
    : 100;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>O meu perfil</h1>
          <p className="dashboard-welcome">Informação pessoal e atividade na comunidade</p>
        </div>
      </div>

      {/* CARTÃO DE PERFIL */}
      <div className="profile-header">
        {profile.avatar_url
          ? <img src={profile.avatar_url} alt="" className="profile-avatar" />
          : <div className="avatar avatar-placeholder profile-avatar" />}
        <div>
          <h2 style={{ margin: 0 }}>{profile.username}</h2>
          <p className="dashboard-welcome">
            {profile.days_as_member !== null
              ? `Membro há ${profile.days_as_member} dias (desde ${formatDate(profile.joined_at)})`
              : 'Membro do Club Party'}
          </p>
          {profile.roles.length > 0 && (
            <div className="role-chips" style={{ marginTop: '0.6rem' }}>
              {profile.roles.map(role => (
                <span
                  key={role.name}
                  className="role-chip role-chip-active"
                  style={role.color !== 0 ? { borderColor: `#${role.color.toString(16).padStart(6, '0')}` } : {}}
                >
                  {role.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STATS RÁPIDOS */}
      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="stat-number">{profile.days_as_member ?? '-'}</span>
          <span className="stat-label">Dias na comunidade</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-number">{invites.count}</span>
          <span className="stat-label">Convites realizados</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-number" style={{ color: moderation.active_warnings > 0 ? '#fbbf24' : undefined }}>
            {moderation.active_warnings}
          </span>
          <span className="stat-label">Avisos ativos</span>
        </div>
      </div>

      {/* PROGRESSO DE CONVITES */}
      <h2 className="section-title">Progresso de Convites</h2>
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        {invites.current_tier && (
          <p style={{ marginBottom: '0.8rem' }}>
            Cargo atual: <span className={`roles-table-badge roles-badge-${invites.current_tier.toLowerCase()}`}>{invites.current_tier}</span>
          </p>
        )}
        {invites.next_tier ? (
          <>
            <p className="text-muted" style={{ marginBottom: '0.6rem', fontSize: '0.9rem' }}>
              Faltam <strong>{Math.max(0, invites.next_tier.needed - invites.count)}</strong> convites
              para o cargo <strong>{invites.next_tier.name}</strong>
            </p>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </>
        ) : (
          <p className="text-muted">🎉 Atingiste o nível máximo de convites!</p>
        )}
        <p className="form-hint" style={{ marginTop: '0.8rem' }}>
          Convida amigos com o teu link pessoal de convite no Discord para subires de cargo.
          Consulta as <Link to="/regras" className="member-link">regras completas</Link> para mais detalhes.
        </p>
      </div>

      {/* LINKS RÁPIDOS */}
      <h2 className="section-title">Atalhos</h2>
      <div className="quick-links-grid">
        <a href={GUILD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="quick-link-card">
          <span className="quick-link-icon">💬</span>
          <span>Abrir o Discord</span>
        </a>
        <a href={SHOP_URL} target="_blank" rel="noopener noreferrer" className="quick-link-card">
          <span className="quick-link-icon">🛍️</span>
          <span>Loja Club Party</span>
        </a>
        <Link to="/regras" className="quick-link-card">
          <span className="quick-link-icon">📜</span>
          <span>Regras do servidor</span>
        </Link>
        <Link to="/equipa" className="quick-link-card">
          <span className="quick-link-icon">👥</span>
          <span>A nossa equipa</span>
        </Link>
      </div>

      {/* HISTÓRICO PESSOAL */}
      <h2 className="section-title">O meu histórico</h2>
      {moderation.logs.length === 0 ? (
        <p className="table-empty">Sem registos — o teu histórico está limpo! 🎉</p>
      ) : (
        <div className="timeline">
          {moderation.logs.map(log => {
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
                  {log.source === 'automod' && (
                    <span className="status-badge status-failed">🤖 Automático</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}