import { useAuth } from '../lib/useAuth';
import logo from '../assets/logo-navbar.svg';

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
const REDIRECT_URI = encodeURIComponent(`${window.location.origin}/.netlify/functions/auth-callback`);
const SCOPE = encodeURIComponent("identify guilds.members.read");
const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`;

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <nav className="navbar">
      <img src={logo} alt="Club Party" className="navbar-logo" />

      <div className="navbar-actions">
        {loading ? null : user ? (
          <>
            <span className="navbar-username">Olá, {user.username}</span>
            {(user.dashboard_role === 'admin' || user.dashboard_role === 'mod') && (
              <a href="/dashboard" className="button">Dashboard</a>
            )}
            <a href="/.netlify/functions/auth-logout" className="button">Logout</a>
          </>
        ) : (
          <a href={discordLoginUrl} className="button">Login com Discord</a>
        )}
      </div>
    </nav>
  );
}