import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import logo from '../assets/logo-navbar.svg';
import { ShopIcon } from './SocialIcons';

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
const REDIRECT_URI = encodeURIComponent(`${window.location.origin}/.netlify/functions/auth-callback`);
const SCOPE = encodeURIComponent("identify guilds.members.read");
const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`;

export default function Navbar() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/" onClick={() => setMenuOpen(false)}>
        <img src={logo} alt="Club Party" className="navbar-logo" />
      </Link>

      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <div className={`navbar-actions ${menuOpen ? 'navbar-actions-open' : ''}`}>
        <Link to="/regras" className="navbar-link" onClick={() => setMenuOpen(false)}>
          Regras
        </Link>
        <Link to="/equipa" className="navbar-link" onClick={() => setMenuOpen(false)}>
          Equipa
        </Link>
        <a
          href="https://clubparty-shop.fourthwall.com/en-eur"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-link navbar-link-shop"
          onClick={() => setMenuOpen(false)}
        >
          <ShopIcon className="navbar-link-icon" /> Loja
        </a>

        {loading ? null : user ? (
          <>
            <span className="navbar-username">Olá, {user.username}</span>
            {(user.dashboard_role === 'admin' || user.dashboard_role === 'mod') && (
              <Link to="/dashboard" className="button" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            )}
            <a href="/.netlify/functions/auth-logout" className="button button-outline">Logout</a>
          </>
        ) : (
          <a href={discordLoginUrl} className="button">Login com Discord</a>
        )}
      </div>
    </nav>
  );
}