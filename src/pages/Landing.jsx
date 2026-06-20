import logo from '../assets/logo.png';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import ShopProducts from '../components/ShopProducts';

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
  const [stats, setStats] = useState({ online: null, total: null });
  const [partners, setPartners] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/.netlify/functions/guild-stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  // Só busca posts com show_on_homepage = true — usados como parceiros/afiliados
  useEffect(() => {
    fetch('/.netlify/functions/get-recent-posts?homepage=true')
      .then(res => res.json())
      .then(data => setPartners(data.posts || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/.netlify/functions/get-events')
      .then(res => res.json())
      .then(data => setEvents(data.events || []))
      .catch(() => {});
  }, []);

  const upcomingEvents = events
    .filter(e => new Date(e.event_date + 'T00:00:00') >= new Date(new Date().setHours(0,0,0,0)))
    .slice(0, 3);

  return (
    <div className="landing">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-glow" />
        <img src={logo} alt="Club Party" className="hero-logo" />
        <h1>CLUB <span className="accent-text">PARTY</span></h1>

        {/* Subtítulo sem <br> manuais — o CSS controla o line-height e max-width */}
        <p className="hero-subtitle">
          O servidor português onde as pessoas realmente aparecem. Eventos todas as semanas, jogos organizados, e uma comunidade que te conhece pelo nome — não és só mais um número.
        </p>

        {/* Stats — prova social imediata */}
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">
              {stats.total !== null ? stats.total : '—'}
            </span>
            <span className="stat-label">membros</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-number stat-online">
              <span className="online-dot" aria-hidden="true" />
              {stats.online !== null ? stats.online : '—'}
            </span>
            <span className="stat-label">online agora</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-number">2022</span>
            <span className="stat-label">desde</span>
          </div>
        </div>

        <div className="hero-actions">
          <a
            href="https://discord.gg/QkhJmtQgk3"
            className="button"
            rel="noopener noreferrer"
            target="_blank"
          >
            Entrar grátis no Club Party →
          </a>
          <a href="#sobre" className="button button-outline">Saber mais</a>
        </div>
        <p className="hero-fine">
          Comunidade aberta · Entrada gratuita · Sem subscrição obrigatória ·{' '}
          <a href="/regras" className="hero-fine-link">Ver as regras</a>
        </p>
      </section>

      {/* ── PARA QUEM É ISTO? ── */}
      <section className="for-who" id="sobre">
        <p className="section-eyebrow">para quem é?</p>
        <h2>Se és deste tipo de pessoa, vais adorar</h2>
        <div className="for-who-grid">
          <div className="for-who-card">
            <span className="for-who-icon">🎮</span>
            <p>Jogas à noite mas já não tens com quem — os amigos saíram do jogo e tu não.</p>
          </div>
          <div className="for-who-card">
            <span className="for-who-icon">📅</span>
            <p>Queres eventos organizados, com hora marcada, e não só um chat onde ninguém responde.</p>
          </div>
          <div className="for-who-card">
            <span className="for-who-icon">🇵🇹</span>
            <p>Preferes jogar com pessoas que falam a tua língua e entendem as tuas referências.</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES — grid de 4 ── */}
      <section className="features">
        <p className="section-eyebrow">o que oferecemos</p>
        <h2>Mais do que um servidor — uma comunidade</h2>
        <div className="features-grid features-grid--4">
          <div className="feature-card">
            <span className="feature-icon">🎉</span>
            <h3>Eventos semanais</h3>
            <p>Sorteios, noites de jogos e festas temáticas organizadas pela staff todas as semanas — sempre com hora e regras claras.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🤝</span>
            <h3>Membros que ficam</h3>
            <p>Não é um servidor de passagem. Temos membros desde 2022 e uma base ativa que cresce sem perder a qualidade.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🛡️</span>
            <h3>Staff dedicada</h3>
            <p>Equipa de moderação ativa que mantém o servidor respeitoso, divertido e livre de toxicidade — todos os dias.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🏆</span>
            <h3>Sistema de convites</h3>
            <p>Convida amigos e sobe de Bronze a Esmeralda, desbloqueando canais e benefícios exclusivos no servidor.</p>
          </div>
        </div>
      </section>

      {/* ── PRÓXIMOS EVENTOS ── */}
      {upcomingEvents.length > 0 && (
        <section className="events">
          <p className="section-eyebrow">agenda</p>
          <h2>O que aí vem</h2>
          <div className="events-grid">
            {upcomingEvents.map(event => {
              const date = new Date(event.event_date + 'T00:00:00');
              return (
                <div key={event.id} className="event-card">
                  <div className="event-date">
                    <span className="event-day">{date.getDate().toString().padStart(2, '0')}</span>
                    <span className="event-month">
                      {date.toLocaleDateString('pt-PT', { month: 'short' })}
                    </span>
                  </div>
                  <div className="event-info">
                    <h3>{event.emoji} {event.title}</h3>
                    {event.description && <p>{event.description}</p>}
                    {event.event_time && (
                      <span className="event-time">⏰ {event.event_time}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── O QUE SE JOGA AQUI ── */}
      <section className="games-section" id="jogos">
        <p className="section-eyebrow">jogos</p>
        <h2>O que se joga aqui</h2>
        <p className="section-subtitle">
          Canais dedicados e eventos para mais de 16 jogos — e estamos sempre abertos a sugestões.
        </p>
        <div className="games-grid">
          {GAMES.map(game => (
            <div key={game.name} className="game-tile" title={game.name}>
              <img src={game.icon} alt={game.name} />
            </div>
          ))}
        </div>
      </section>

      {/* ── SOBRE NÓS ── */}
      <section className="about-section" id="sobre-nos">
        <p className="section-eyebrow">a nossa história</p>
        <h2>Criados em 2022, cá continuamos</h2>
        <div className="about-columns">
          <p>
            O Club Party nasceu com um objetivo simples: acabar com o problema de jogares com desconhecidos
            aleatórios. Queríamos um sítio onde toda a gente se conhecesse pelo nome — e não só pelo username.
          </p>
          <p>
            Hoje somos uma comunidade variada de jogadores portugueses, com eventos regulares, uma staff comprometida,
            e planos para torneios premiados no futuro. Se entras hoje, és parte da história desde cedo.
          </p>
        </div>
      </section>

      {/* ── PARCEIROS & AFILIADOS ── só aparece se houver posts com show_on_homepage = true ── */}
      {partners.length > 0 && (
        <section className="partners-section">
          <p className="section-eyebrow">parceiros</p>
          <h2>Recomendados pela comunidade</h2>
          <p className="section-subtitle">
            Produtos e serviços que usamos e recomendamos — alguns links são de afiliados.
          </p>
          <div className="partners-grid">
            {partners.map(post => (
              <a
                key={post.id}
                href={post.link_url || '#'}
                className="partner-card"
                target="_blank"
                rel="noopener noreferrer sponsored"
              >
                {post.image_url && (
                  <div
                  className="partner-card-img"
                  style={{ background: post.image_bg_color || '#ffffff' }}
                >
                    <img src={post.image_url} alt={post.title} />
                  </div>
                )}
                <div className="partner-card-body">
                  <h3>{post.title}</h3>
                  <p>{post.content?.slice(0, 80)}{post.content?.length > 80 ? '…' : ''}</p>
                  <span className="partner-cta">Ver oferta →</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── LOJA ── */}
      <section className="shop-section">
        <p className="section-eyebrow">merch</p>
        <h2>Representa a comunidade</h2>
        <p className="section-subtitle">
          T-shirts, hoodies e mais — cada compra apoia diretamente o servidor.
        </p>
        <ShopProducts />
      </section>

      {/* ── CTA FINAL ── */}
      <section className="cta">
        <h2>Pronto para entrar?</h2>
        <p>
          É grátis, demora 10 segundos e já tens{' '}
          {stats.total !== null ? `${stats.total} pessoas` : 'centenas de pessoas'} à tua espera.
        </p>
        <a
          href="https://discord.gg/QkhJmtQgk3"
          className="button"
          rel="noopener noreferrer"
          target="_blank"
        >
          Entrar no Club Party →
        </a>
        <p className="cta-fine">
          Antes de entrar,{' '}
          <a href="/regras" className="cta-fine-link">lê as regras em 2 minutos</a>.
        </p>
      </section>

      <Footer />
    </div>
  );
}