import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ROLE_LABELS = {
  admin: { label: 'Administrador', className: 'staff-badge-admin' },
  mod: { label: 'Moderador', className: 'staff-badge-mod' },
};

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/.netlify/functions/get-staff')
      .then(res => res.json())
      .then(data => setStaff(data.staff || []))
      .finally(() => setLoading(false));
  }, []);

  const admins = staff.filter(s => s.dashboard_role === 'admin');
  const mods = staff.filter(s => s.dashboard_role === 'mod');

  return (
    <div className="staff-page">
      <div className="staff-container">
        <Link to="/" className="back-link">← Voltar à página inicial</Link>

        <h1>A Nossa Equipa</h1>
        <p className="staff-intro">
          Conhece quem está sempre disponível para manter o Club Party um sítio
          seguro, organizado e divertido para todos.
        </p>

        {loading ? (
          <p className="table-empty">A carregar...</p>
        ) : staff.length === 0 ? (
          <p className="table-empty">Sem informação da equipa disponível.</p>
        ) : (
          <>
            {admins.length > 0 && (
              <section className="staff-section">
                <h2>Administradores</h2>
                <div className="staff-grid">
                  {admins.map(member => (
                    <StaffCard key={member.discord_id} member={member} />
                  ))}
                </div>
              </section>
            )}

            {mods.length > 0 && (
              <section className="staff-section">
                <h2>Moderadores</h2>
                <div className="staff-grid">
                  {mods.map(member => (
                    <StaffCard key={member.discord_id} member={member} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StaffCard({ member }) {
  const meta = ROLE_LABELS[member.dashboard_role];
  return (
    <div className="staff-card">
      {member.avatar_url ? (
        <img src={member.avatar_url} alt={member.username} className="staff-avatar" />
      ) : (
        <div className="staff-avatar staff-avatar-placeholder" />
      )}
      <div className="staff-info">
        <span className="staff-name">{member.global_name || member.username}</span>
        <span className={`staff-badge ${meta.className}`}>{meta.label}</span>
      </div>
    </div>
  );
}