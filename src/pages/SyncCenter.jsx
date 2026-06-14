import { useState } from 'react';
import { Link } from 'react-router-dom';

const SYNC_ACTIONS = [
  {
    id: 'sync-members',
    title: 'Sincronizar Membros',
    description: 'Atualiza a lista de membros, avatares, cargos e datas de entrada a partir do Discord.',
    icon: '👥',
  },
  {
    id: 'sync-invites',
    title: 'Sincronizar Convites',
    description: 'Atualiza a contagem de convites ativos por membro, usada no progresso de cargos.',
    icon: '🔗',
  },
];

export default function SyncCenter() {
  const [status, setStatus] = useState({}); // { [id]: 'loading' | 'success' | 'error' }
  const [results, setResults] = useState({}); // { [id]: resultado da function }

  async function handleSync(actionId) {
    setStatus(prev => ({ ...prev, [actionId]: 'loading' }));

    try {
      const res = await fetch(`/.netlify/functions/${actionId}`, { method: 'POST' });
      const data = await res.json().catch(() => null);

      if (res.ok) {
        setStatus(prev => ({ ...prev, [actionId]: 'success' }));
        setResults(prev => ({ ...prev, [actionId]: data }));
      } else {
        setStatus(prev => ({ ...prev, [actionId]: 'error' }));
      }
    } catch {
      setStatus(prev => ({ ...prev, [actionId]: 'error' }));
    }

    // limpa o estado de sucesso/erro depois de uns segundos
    setTimeout(() => {
      setStatus(prev => ({ ...prev, [actionId]: null }));
    }, 4000);
  }

  function renderResultSummary(actionId) {
    const data = results[actionId];
    if (!data) return null;

    if (actionId === 'sync-members') {
      return `${data.synced} membros sincronizados`;
    }
    if (actionId === 'sync-invites') {
      return `${data.synced} membros com convites ativos (${data.total_invites} convites no total)`;
    }
    return null;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <Link to="/dashboard" className="back-link">← Voltar ao Dashboard</Link>
          <h1>Sincronização</h1>
          <p className="dashboard-welcome">
            Atualiza os dados do site a partir do Discord. Recomendado correr periodicamente.
          </p>
        </div>
      </div>

      <div className="sync-grid">
        {SYNC_ACTIONS.map(action => {
          const currentStatus = status[action.id];
          return (
            <div key={action.id} className="sync-card">
              <div className="sync-card-icon">{action.icon}</div>
              <div className="sync-card-body">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                {currentStatus === 'success' && (
                  <p className="form-success" style={{ marginTop: '0.6rem' }}>
                    ✅ {renderResultSummary(action.id) || 'Sincronizado com sucesso'}
                  </p>
                )}
                {currentStatus === 'error' && (
                  <p className="form-error" style={{ marginTop: '0.6rem' }}>
                    ❌ Erro ao sincronizar. Tenta novamente.
                  </p>
                )}
              </div>
              <button
                className="button"
                onClick={() => handleSync(action.id)}
                disabled={currentStatus === 'loading'}
              >
                {currentStatus === 'loading' ? 'A sincronizar...' : 'Sincronizar'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}