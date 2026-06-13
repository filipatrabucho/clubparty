import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/.netlify/functions/get-members')
      .then(res => res.json())
      .then(data => setMembers(data.members || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(endpoint, discord_id) {
    const reason = prompt('Motivo:');
    if (reason === null) return;

    let body = { discord_id, reason };
    if (endpoint === 'timeout-member') {
      const minutes = prompt('Duração em minutos:', '60');
      if (!minutes) return;
      body.duration_minutes = Number(minutes);
    }

    const res = await fetch(`/.netlify/functions/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert('Ação aplicada com sucesso');
      if (endpoint !== 'timeout-member') {
        setMembers(prev => prev.filter(m => m.discord_id !== discord_id));
      }
    } else {
      alert('Erro ao aplicar ação');
    }
  }

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="dashboard">
      <h1>Membros</h1>
      <table className="members-table">
        <thead>
          <tr>
            <th></th>
            <th>Username</th>
            <th>Entrou em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.discord_id}>
              <td><img src={m.avatar_url} alt="" className="avatar" /></td>
              <td>{m.username}</td>
              <td>{new Date(m.joined_at).toLocaleDateString()}</td>
              <td>
                <button className="button" onClick={() => handleAction('timeout-member', m.discord_id)}>Castigar</button>
                <button className="button" onClick={() => handleAction('kick-member', m.discord_id)}>Kick</button>
                <button className="button" onClick={() => handleAction('ban-member', m.discord_id)}>Ban</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}