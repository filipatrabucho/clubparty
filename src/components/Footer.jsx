import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { DiscordIcon, InstagramIcon, FacebookIcon, EmailIcon, ShopIcon } from './SocialIcons';

export default function Footer() {
  return (
    <footer className="footer">
      <img src={logo} alt="Club Party" className="footer-logo" />

      <div className="footer-socials">
        <a href="https://discord.gg/QkhJmtQgk3" target="_blank" rel="noopener noreferrer" title="Discord">
          <DiscordIcon className="social-icon" />
        </a>
        <a href="https://www.instagram.com/clubpartyserver/" target="_blank" rel="noopener noreferrer" title="Instagram">
          <InstagramIcon className="social-icon" />
        </a>
        <a href="https://www.facebook.com/clubparty" target="_blank" rel="noopener noreferrer" title="Facebook">
          <FacebookIcon className="social-icon" />
        </a>
        <a href="mailto:clubpartyserver@gmail.com" title="Email">
          <EmailIcon className="social-icon" />
        </a>
        <a href="https://a-tua-loja.fourthwall.com" target="_blank" rel="noopener noreferrer" title="Loja">
          <ShopIcon className="social-icon" />
        </a>
        <Link to="/regras" className="footer-text-link">Regras</Link>
        <Link to="/equipa" className="footer-text-link">Equipa</Link>
      </div>

      <p>&copy; {new Date().getFullYear()} Club Party. Todos os direitos reservados.</p>
    </footer>
  );
}