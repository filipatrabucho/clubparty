import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

export default function BannedMembers() {
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);

  useEffect(() => { loadBans(); }, []);

  async function loadBans() {
    setLoading(true);
    const res = await fetch('/.netlify/functions/get-bans');
    const data = await res.json();
    setBans(data.bans || []);
    setLoading(false);
  }

  async function confirmUnban({ reason }) {
    const { discord_id } = actionModal;

    const res = await fetch('/.netlify/functions/unban-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discord_id, reason }),
    });

    if (res.ok) {
      setBans(prev => prev.filter(b => b.discord_id !== discord_id));
    } else {
      alert('Erro ao desbanir membro');
    }

    setActionModal(null);
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <Link to="/dashboard" className="back-link">← Voltar ao Dashboard</Link>
          <h1>Membros Banidos</h1>
          <p className="dashboard-welcome">Lista de utilizadores atualmente banidos do servidor</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="stat-number">{bans.length}</span>
          <span className="stat-label">Total de banidos</span>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <p className="table-empty">A carregar...</p>
        ) : bans.length === 0 ? (
          <p className="table-empty">Não há membros banidos atualmente. 🎉</p>
        ) : (
          <table className="members-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}></th>
                <th>Username</th>
                <th>Motivo do ban</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {bans.map(b => (
                <tr key={b.discord_id}>
                  <td>
                    {b.avatar_url
                      ? <img src={b.avatar_url} alt="" className="avatar" />
                      : <div className="avatar avatar-placeholder" />}
                  </td>
                  <td>
                    <Link to={`/dashboard/member/${b.discord_id}`} className="member-username member-link">
                      {b.username}
                    </Link>
                  </td>
                  <td className="text-muted">{b.reason || '—'}</td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="button-sm"
                        onClick={() => setActionModal({ discord_id: b.discord_id, username: b.username })}
                      >
                        🔓 Desbanir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={!!actionModal}
        title={`Desbanir ${actionModal?.username}?`}
        description="O utilizador poderá voltar a entrar no servidor com um convite."
        confirmLabel="Desbanir"
        confirmColor="default"
        onConfirm={confirmUnban}
        onCancel={() => setActionModal(null)}
      />
    </div>
  );
}