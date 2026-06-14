import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#D65A7E', '#fbbf24', '#60a5fa', '#4ade80', '#f87171', '#a78bfa', '#fb923c'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/.netlify/functions/get-analytics')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard"><p className="table-empty">A carregar...</p></div>;
  if (!data) return <div className="dashboard"><p className="table-empty">Erro ao carregar estatísticas.</p></div>;

  const { newMembersData, actionsData, sourceData, totals } = data;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <Link to="/dashboard" className="back-link">← Voltar ao Dashboard</Link>
          <h1>Estatísticas</h1>
          <p className="dashboard-welcome">Visão geral da atividade do servidor</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="stat-number">{totals.totalMembers}</span>
          <span className="stat-label">Membros atuais</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-number">{totals.totalBans}</span>
          <span className="stat-label">Bans (total)</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-number" style={{ color: totals.activeWarnings > 0 ? '#fbbf24' : undefined }}>
            {totals.activeWarnings}
          </span>
          <span className="stat-label">Avisos ativos</span>
        </div>
        <div className="dashboard-stat-card">
          <span className="stat-number">{totals.actionsLast30Days}</span>
          <span className="stat-label">Ações (30 dias)</span>
        </div>
      </div>

      <div className="charts-grid">
        {/* Novos membros por semana */}
        <div className="chart-card chart-card-wide">
          <h2 className="section-title">Novos Membros por Semana</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={newMembersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="week" stroke="#a0a3a8" fontSize={12} />
              <YAxis stroke="#a0a3a8" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1a1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                labelStyle={{ color: '#f5f5f5' }}
              />
              <Line type="monotone" dataKey="novos" stroke="#D65A7E" strokeWidth={2} dot={{ fill: '#D65A7E' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ações de moderação por tipo */}
        <div className="chart-card">
          <h2 className="section-title">Ações de Moderação (30 dias)</h2>
          {actionsData.length === 0 ? (
            <p className="table-empty">Sem ações registadas nos últimos 30 dias.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={actionsData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#a0a3a8" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#a0a3a8" fontSize={12} width={120} />
                <Tooltip
                  contentStyle={{ background: '#1a1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#f5f5f5' }}
                />
                <Bar dataKey="value" fill="#D65A7E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Manual vs Automático */}
        <div className="chart-card">
          <h2 className="section-title">Manual vs Automático</h2>
          {totals.actionsLast30Days === 0 ? (
            <p className="table-empty">Sem dados suficientes.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sourceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}