import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STATUS_LABELS = {
  draft: { label: 'Rascunho', className: 'status-draft' },
  published: { label: 'Publicado', className: 'status-published' },
  failed: { label: 'Falhou', className: 'status-failed' },
};
export default function PostsHistory() {
  const GUILD_ID = import.meta.env.VITE_DISCORD_GUILD_ID;
  const [posts, setPosts] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const canManagePosts = ['mod', 'admin'].includes(user?.dashboard_role);
  
  useEffect(() => {
    loadPosts();
    fetch('/.netlify/functions/get-channels')
      .then(res => res.json())
      .then(data => setChannels(data.channels || []));
  }, []);

  async function loadPosts() {
    setLoading(true);
    const res = await fetch('/.netlify/functions/get-posts');
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }

  async function handleDelete(post) {
    if (!confirm(`Apagar a publicação "${post.title}"? Isto também remove a mensagem do Discord (se ainda existir).`)) return;

    const res = await fetch('/.netlify/functions/delete-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.id }),
    });

    if (res.ok) {
      setPosts(prev => prev.filter(p => p.id !== post.id));
    } else {
      alert('Erro ao apagar publicação');
    }
  }

  function channelName(id) {
    const c = channels.find(c => c.id === id);
    return c ? `#${c.name}` : id;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <Link to="/dashboard" className="back-link">← Voltar ao Dashboard</Link>
          <h1>Histórico de Publicações</h1>
          <p className="dashboard-welcome">Todas as publicações criadas a partir do site</p>
        </div>
        <div className="dashboard-actions">
          {canManagePosts && (
            <Link to="/dashboard/posts" className="button">+ Nova publicação</Link>
          )}
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="stat-number">{posts.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-number">{posts.filter(p => p.status === 'published').length}</span>
          <span className="stat-label">Publicadas</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-number">{posts.filter(p => p.status === 'failed').length}</span>
          <span className="stat-label">Falhadas</span>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <p className="table-empty">A carregar...</p>
        ) : posts.length === 0 ? (
          <p className="table-empty">Ainda não foram criadas publicações.</p>
        ) : (
          <table className="members-table">
            <thead>
              <tr>
                <th></th>
                <th>Título</th>
                <th>Canal</th>
                <th>Estado</th>
                <th>Publicado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>
                    {post.image_url ? (
                      <img src={post.image_url} alt="" className="post-thumb" />
                    ) : (
                      <div className="post-thumb post-thumb-empty">📝</div>
                    )}
                  </td>
                  <td>
                    <span className="member-username">{post.title}</span>
                    <div className="post-excerpt">{post.content?.slice(0, 60)}{post.content?.length > 60 ? '…' : ''}</div>
                  </td>
                  <td className="text-muted">{channelName(post.target_channel_id)}</td>
                  <td>
                    <span className={`status-badge ${STATUS_LABELS[post.status]?.className || ''}`}>
                      {STATUS_LABELS[post.status]?.label || post.status}
                    </span>
                  </td>
                  <td className="text-muted">{formatDate(post.published_at || post.created_at)}</td>
                  <td>
                    <div className="actions-cell">
                      {post.discord_message_id && (
                      <a  href={`https://discord.com/channels/${GUILD_ID}/${post.target_channel_id}/${post.discord_message_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="button-sm"
                    >
                        🔗 Ver
                    </a>
                    )}
                      {canManagePosts && (
                        <button className="button-sm button-danger" onClick={() => handleDelete(post.id)}>
                          🗑️ Apagar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}