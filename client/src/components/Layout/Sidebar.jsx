import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LuLayoutDashboard,
  LuArrowLeftRight,
  LuTarget,
  LuBrain,
  LuLogOut,
} from 'react-icons/lu';
import './Layout.css';

const links = [
  { to: '/',             label: 'Dashboard',    icon: <LuLayoutDashboard /> },
  { to: '/transactions', label: 'Transactions', icon: <LuArrowLeftRight /> },
  { to: '/goals',        label: 'Goals',        icon: <LuTarget /> },
  { to: '/insights',     label: 'Insights',     icon: <LuBrain /> },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} onMouseLeave={onClose}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span className="logo-icon">₹</span>
          </div>
          <div>
            <h1 className="brand-name">FinTracker</h1>
            <p className="brand-tagline">Smart Finance</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'User'}</span>
              <span className="sidebar-user-email">{user?.email || ''}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
            <LuLogOut />
          </button>
        </div>
      </aside>
    </>
  );
}
