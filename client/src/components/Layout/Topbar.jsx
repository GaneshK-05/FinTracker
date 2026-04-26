import { LuMenu, LuBell, LuSun, LuMoon } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Layout.css';

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn btn-ghost topbar-menu-btn" onClick={onMenuClick}>
          <LuMenu size={20} />
        </button>
        <h2 className="topbar-title">{title}</h2>
      </div>

      <div className="topbar-right">
        <button className="topbar-notification" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <LuSun size={18} /> : <LuMoon size={18} />}
        </button>
        <button className="topbar-notification">
          <LuBell size={18} />
        </button>
        <div
          className="topbar-avatar"
          onClick={() => navigate('/profile')}
          title="Go to Profile"
          style={{ cursor: 'pointer' }}
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
