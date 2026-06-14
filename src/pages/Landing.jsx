import logo from '../assets/logo.png';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const GAMES = [
  { name: 'Among Us', icon: '/games/AMOUNGS.png' },
  { name: 'Apex Legends', icon: '/games/apex.png' },
  { name: 'Borderlands', icon: '/games/borderlands.png' },
  { name: 'CS:GO', icon: '/games/csgo.png' },
  { name: 'Dead by Daylight', icon: '/games/dead-by-daylight.png' },
  { name: 'Fall Guys', icon: '/games/fallguys.png' },
  { name: 'FIFA', icon: '/games/fifa.png' },
  { name: 'Genshin Impact', icon: '/games/Genshin-Impact.png' },
  { name: 'GTA V', icon: '/games/gtav.png' },
  { name: 'League of Legends', icon: '/games/lol.png' },
  { name: 'Minecraft', icon: '/games/minecraft.png' },
  { name: 'Rocket League', icon: '/games/rocket_league.png' },
  { name: 'Rust', icon: '/games/rust.png' },
  { name: 'The Sims', icon: '/games/sims.png' },
  { name: 'Valorant', icon: '/games/valorant.png' },
  { name: 'Warzone', icon: '/games/warzone.png' },
];

export default function Landing() {
  const [stats, setStats] = useState({ online: '...', total: '...' });
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    fetch('/.netlify/functions/guild-stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/.netlify/functions/get-recent-posts')
      .then(res => res.json())
      .then(data => setRecentPosts(data.posts || []))
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

      {/* EVENTOS */}
      <section className="events">
        <h2>Próximos Eventos</h2>
        <div className="events-grid">
          <div className="event-card">
            <div className="event-date">
              <span className="event-day">21</span>
              <span className="event-month">Jun</span>
            </div>
            <div className="event-info">
              <h3>🎉 Festa de Verão</h3>
              <p>Noite especial com música, sorteios e cargo VIP em jogo.</p>
              <span className="event-time">⏰ Sábado, 22h00</span>
            </div>
          </div>
          <div className="event-card">
            <div className="event-date">
              <span className="event-day">28</span>
              <span className="event-month">Jun</span>
            </div>
            <div className="event-info">
              <h3>🎮 Torneio Comunitário</h3>
              <p>Competição entre membros com prémios exclusivos.</p>
              <span className="event-time">⏰ Sábado, 21h00</span>
            </div>
          </div>
          <div className="event-card">
            <div className="event-date">
              <span className="event-day">05</span>
              <span className="event-month">Jul</span>
            </div>
            <div className="event-info">
              <h3>🎙️ AMA com a Staff</h3>
              <p>Pergunta-nos qualquer coisa sobre o servidor ao vivo.</p>
              <span className="event-time">⏰ Sexta, 20h00</span>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE NÓS + JOGOS */}
      <section className="about-games" id="sobre-nos">
        <div className="about-games-grid">
          <div className="about-text">
            <h2>Sobre Nós</h2>
            <p>
              Club Party é um servidor de Discord criado no início de 2022, com o objetivo
              de formar uma comunidade variada dentro do mundo dos jogos.
            </p>
            <p>
              O principal objetivo é reunir o máximo de jogadores possível, para que
              ninguém tenha de lidar com o problema de calhar com pessoas aleatórias
              na hora de jogar uma partida competitiva.
            </p>
            <p>
              Incentivamos todos os membros a conhecerem-se uns aos outros, para que
              a experiência dentro do servidor seja a melhor possível.
            </p>
            <p>
              Temos como objetivo dinamizar projetos como a criação de equipas
              profissionais e, futuramente, torneios premiados.
            </p>
          </div>
          <div className="games-grid">
            {GAMES.map(game => (
              <div key={game.name} className="game-tile" title={game.name}>
                <img src={game.icon} alt={game.name} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÚLTIMAS PUBLICAÇÕES */}
      {recentPosts.length > 0 && (
        <section className="recent-posts">
          <h2>Últimas Novidades</h2>
          <p className="gallery-subtitle">O que tem acontecido na nossa comunidade</p>
          <div className="posts-grid">
            {recentPosts.map(post => (
              <div key={post.id} className="post-card">
                <img src={post.image_url} alt={post.title} />
                <div className="post-card-content">
                  <h3>{post.title}</h3>
                  <p>{post.content?.slice(0, 90)}{post.content?.length > 90 ? '…' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="cta">
        <h2>Pronto para entrar?</h2>
        <p>Junta-te a nós agora mesmo. É grátis e demora 10 segundos.</p>
        <a href="https://discord.gg/o-teu-invite" className="button">Entrar no Discord</a>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}