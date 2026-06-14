import { useState, useRef, useEffect } from 'react';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <div className="navbar-user" ref={userMenuRef}>
            <button
              className="navbar-user-trigger"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="navbar-user-avatar" />
                : <div className="navbar-user-avatar navbar-user-avatar-placeholder" />}
              <span className="navbar-username">Olá, {user.username}</span>
              <span className="navbar-user-caret">{userMenuOpen ? '▲' : '▼'}</span>
            </button>

            {userMenuOpen && (
              <div className="navbar-user-dropdown">
                <Link
                  to="/perfil"
                  className="navbar-dropdown-item"
                  onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }}
                >
                  👤 Meu Perfil
                </Link>
                {(user.dashboard_role === 'admin' || user.dashboard_role === 'mod' || user.dashboard_role === 'helper') && (
                  <Link
                    to="/dashboard"
                    className="navbar-dropdown-item"
                    onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }}
                  >
                    🛠️ Dashboard Staff
                  </Link>
                )}
                <a href="/.netlify/functions/auth-logout" className="navbar-dropdown-item navbar-dropdown-item-danger">
                  🚪 Logout
                </a>
              </div>
            )}
          </div>
        ) : (
          <a href={discordLoginUrl} className="button" onClick={() => setMenuOpen(false)}>Login com Discord</a>
        )}
      </div>
    </nav>
  );
}