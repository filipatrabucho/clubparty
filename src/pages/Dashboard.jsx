import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import ConfirmModal from '../components/ConfirmModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('username');
  const [sortDir, setSortDir] = useState('asc');
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [roleManagerFor, setRoleManagerFor] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { endpoint, discord_id, username }
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadMembers();
    loadRoles();
  }, []);

  
  useEffect(() => {
    let result = [...members];

    if (search.trim()) {
      result = result.filter(m =>
        m.username?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedRole) {
      result = result.filter(m =>
        Array.isArray(m.roles) && m.roles.includes(selectedRole)
      );
    }

    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'username') {
        valA = a.username?.toLowerCase() || '';
        valB = b.username?.toLowerCase() || '';
      } else if (sortBy === 'joined_at') {
        valA = new Date(a.joined_at || 0);
        valB = new Date(b.joined_at || 0);
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    setFiltered(result);
    setCurrentPage(1); // reset ao mudar filtros/ordenação
  }, [members, search, sortBy, sortDir, selectedRole]);

  async function loadRoles() {
    const res = await fetch('/.netlify/functions/get-roles');
    const data = await res.json();
    setRoles(data.roles || []);
  }

  async function loadMembers() {
    setLoading(true);
    const res = await fetch('/.netlify/functions/get-members');
    const data = await res.json();
    setMembers(data.members || []);
    setLoading(false);
  }

  async function handleSync() {
    setSyncing(true);
    const res = await fetch('/.netlify/functions/sync-members', { method: 'POST' });
    if (res.ok) await loadMembers();
    else alert('Erro ao sincronizar membros');
    setSyncing(false);
  }

  function openActionModal(endpoint, discord_id, username) {
    setActionModal({ endpoint, discord_id, username });
  }

  async function confirmAction({ reason, duration_minutes }) {
    const { endpoint, discord_id, username } = actionModal;

    let body = { discord_id, reason };
    if (endpoint === 'timeout-member') {
      body.duration_minutes = duration_minutes;
    }

    const res = await fetch(`/.netlify/functions/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      if (endpoint === 'kick-member' || endpoint === 'ban-member') {
        setMembers(prev => prev.filter(m => m.discord_id !== discord_id));
      } else if (endpoint === 'warn-member') {
        const data = await res.json();
        setMembers(prev => prev.map(m =>
          m.discord_id === discord_id ? { ...m, active_warnings: data.active_warnings } : m
        ));
      }
    } else {
      alert(`Erro ao aplicar ação sobre ${username}`);
    }

    setActionModal(null);
  }

  async function handleToggleRole(discord_id, role_id, hasRole) {
    const endpoint = hasRole ? 'remove-role' : 'add-role';

    const res = await fetch(`/.netlify/functions/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discord_id, role_id }),
    });

    if (res.ok) {
      setMembers(prev => prev.map(m => {
        if (m.discord_id !== discord_id) return m;
        const currentRoles = m.roles || [];
        const updatedRoles = hasRole
          ? currentRoles.filter(r => r !== role_id)
          : [...currentRoles, role_id];
        return { ...m, roles: updatedRoles };
      }));
    } else {
      alert('Erro ao alterar cargo');
    }
  }

  function toggleSort(field) {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  }

  const sortIcon = (field) => sortBy === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
  
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedMembers = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-welcome">Bem-vindo, {user?.username}</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/dashboard/posts" className="button">+ Nova publicação</Link>
          <Link to="/dashboard/posts/history" className="button button-outline">📜 Histórico</Link>
          <button className="button button-outline" onClick={handleSync} disabled={syncing}>
            {syncing ? 'A sincronizar...' : 'Sincronizar membros'}
          </button>
          <Link to="/dashboard/bans" className="button button-outline">🔨 Banidos</Link>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="stat-number">{members.length}</span>
          <span className="stat-label">Total de membros</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-number">{filtered.length}</span>
          <span className="stat-label">Resultados</span>
        </div>
      </div>

      <div className="dashboard-filters">
        <input
          className="filter-input"
          type="text"
          placeholder="🔍 Pesquisar por username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="role-combobox">
          <input
            className="filter-input"
            type="text"
            placeholder="🎭 Filtrar por cargo..."
            value={roleSearch}
            onChange={e => { setRoleSearch(e.target.value); setRoleDropdownOpen(true); }}
            onFocus={() => setRoleDropdownOpen(true)}
            onBlur={() => setTimeout(() => setRoleDropdownOpen(false), 150)}
          />
          {roleDropdownOpen && (
            <div className="role-dropdown">
              <div
                className="role-option"
                onMouseDown={() => { setSelectedRole(''); setRoleSearch(''); setRoleDropdownOpen(false); }}
              >
                Todos os cargos
              </div>
              {roles
                .filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()))
                .map(r => (
                  <div
                    key={r.id}
                    className="role-option"
                    onMouseDown={() => { setSelectedRole(r.id); setRoleSearch(r.name); setRoleDropdownOpen(false); }}
                  >
                    {r.color !== 0 && (
                      <span
                        className="role-color-dot"
                        style={{ background: `#${r.color.toString(16).padStart(6, '0')}` }}
                      />
                    )}
                    {r.name}
                  </div>
                ))
              }
              {roles.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase())).length === 0 && (
                <div className="role-option role-option-empty">Nenhum cargo encontrado</div>
              )}
            </div>
          )}
        </div>

        {(search || selectedRole) && (
          <button className="filter-clear" onClick={() => {
            setSearch('');
            setSelectedRole('');
            setRoleSearch('');
          }}>
            ✕ Limpar filtros
          </button>
        )}
      </div>

      <div className="table-wrapper">
        {loading ? (
          <p className="table-empty">A carregar...</p>
        ) : filtered.length === 0 ? (
          <p className="table-empty">
            {members.length === 0
              ? 'Sem membros em cache. Clica em "Sincronizar membros".'
              : 'Nenhum membro encontrado com esse nome.'}
          </p>
        ) : (
          <table className="members-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}></th>
                <th className="sortable" onClick={() => toggleSort('username')}>
                  Username{sortIcon('username')}
                </th>
                <th className="sortable" onClick={() => toggleSort('joined_at')}>
                  Entrou em{sortIcon('joined_at')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map(m => (
                <React.Fragment key={m.discord_id}>
                  <tr>
                    <td>
                      {m.avatar_url
                        ? <img src={m.avatar_url} alt="" className="avatar" />
                        : <div className="avatar avatar-placeholder" />}
                    </td>
                    <td>
                      <Link to={`/dashboard/member/${m.discord_id}`} className="member-username member-link">
                        {m.username}
                      </Link>    
                      {m.active_warnings > 0 && (
                        <span className="warning-badge" title={`${m.active_warnings} aviso(s) ativo(s)`}>
                          ⚠️ {m.active_warnings}
                        </span>
                      )}           
                    </td>
                    <td className="text-muted">
                      {m.joined_at ? new Date(m.joined_at).toLocaleDateString('pt-PT') : '-'}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="button-sm" onClick={() => setRoleManagerFor(roleManagerFor === m.discord_id ? null : m.discord_id)}>
                          🎭 Cargos
                        </button>
                        <button className="button-sm" onClick={() => openActionModal('warn-member', m.discord_id, m.username)}>
                          ⚠️ Avisar
                        </button>
                        <button className="button-sm" onClick={() => openActionModal('timeout-member', m.discord_id, m.username)}>
                          ⏱ Castigar
                        </button>
                        <button className="button-sm button-warn" onClick={() => openActionModal('kick-member', m.discord_id, m.username)}>
                          👢 Kick
                        </button>
                        <button className="button-sm button-danger" onClick={() => openActionModal('ban-member', m.discord_id, m.username)}>
                          🔨 Ban
                        </button>
                      </div>
                    </td>
                  </tr>

                  {roleManagerFor === m.discord_id && (
                    <tr className="role-manager-row">
                      <td colSpan={4}>
                        <div className="role-manager">
                          <span className="role-manager-label">Cargos de {m.username}:</span>
                          <div className="role-chips">
                            {roles.map(r => {
                              const hasRole = Array.isArray(m.roles) && m.roles.includes(r.id);
                              return (
                                <button
                                  key={r.id}
                                  className={`role-chip ${hasRole ? 'role-chip-active' : ''}`}
                                  onClick={() => handleToggleRole(m.discord_id, r.id, hasRole)}
                                  style={hasRole && r.color !== 0 ? { borderColor: `#${r.color.toString(16).padStart(6, '0')}` } : {}}
                                >
                                  {r.name} {hasRole ? '✓' : '+'}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="button-sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Anterior
          </button>

          <span className="pagination-info">
            Página {currentPage} de {totalPages}
            <span className="text-muted"> ({filtered.length} membros)</span>
          </span>

          <button
            className="button-sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima →
          </button>
        </div>
      )}
      <ConfirmModal
            isOpen={!!actionModal}
            title={
              actionModal?.endpoint === 'ban-member' ? `Banir ${actionModal?.username}?`
              : actionModal?.endpoint === 'kick-member' ? `Expulsar ${actionModal?.username}?`
              : actionModal?.endpoint === 'warn-member' ? `Avisar ${actionModal?.username}?`
              : `Castigar ${actionModal?.username}?`
            }
            description={
              actionModal?.endpoint === 'ban-member' ? 'Esta ação remove o membro do servidor permanentemente, até ser desbanido.'
              : actionModal?.endpoint === 'kick-member' ? 'O membro será removido do servidor, mas pode voltar a entrar com um convite.'
              : actionModal?.endpoint === 'warn-member' ? 'O aviso fica registado no histórico do membro.'
              : 'O membro fica impedido de enviar mensagens/falar durante o tempo definido.'
            }
            confirmLabel={
              actionModal?.endpoint === 'ban-member' ? 'Banir'
              : actionModal?.endpoint === 'kick-member' ? 'Expulsar'
              : actionModal?.endpoint === 'warn-member' ? 'Avisar'
              : 'Castigar'
            }
            confirmColor={
              actionModal?.endpoint === 'timeout-member' || actionModal?.endpoint === 'warn-member' ? 'warn' : 'danger'
            }
            showDuration={actionModal?.endpoint === 'timeout-member'}
            onConfirm={confirmAction}
            onCancel={() => setActionModal(null)}
          />
    </div>
  );
}