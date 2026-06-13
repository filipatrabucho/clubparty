import logo from '../assets/logo.png';
import { useEffect, useState } from 'react';

export default function Landing() {
  const [stats, setStats] = useState({ online: '...', total: '...' });

  useEffect(() => {
    fetch('/.netlify/functions/guild-stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" />
        <img src={logo} alt="Club Party" className="hero-logo" />
        <h1>CLUB <span className="accent-text">PARTY</span></h1>
        <p className="hero-subtitle">
          A festa privada onde és membro o ano inteiro.<br />
          Comunidade, eventos e boa vibe — todos os dias.
        </p>
        <div className="hero-actions">
          <a href="https://discord.gg/o-teu-invite" className="button">Entrar no Discord</a>
          <a href="#sobre" className="button button-outline">Saber mais</a>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Membros</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-number stat-online">{stats.online}</span>
            <span className="stat-label">Online agora</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="sobre">
        <h2>Porque entrar no Club Party?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🎉 Eventos semanais</h3>
            <p>Festas temáticas, sorteios e atividades exclusivas para a comunidade.</p>
          </div>
          <div className="feature-card">
            <h3>🤝 Comunidade ativa</h3>
            <p>Centenas de membros sempre online, prontos para conversar e jogar.</p>
          </div>
          <div className="feature-card">
            <h3>🛡️ Ambiente moderado</h3>
            <p>Staff dedicado a manter o servidor seguro, respeitoso e divertido.</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta">
        <h2>Pronto para entrar?</h2>
        <p>Junta-te a nós agora mesmo. É grátis e demora 10 segundos.</p>
        <a href="https://discord.gg/o-teu-invite" className="button">Entrar no Discord</a>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <img src={logo} alt="Club Party" className="footer-logo" />
        <p>&copy; {new Date().getFullYear()} Club Party. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}