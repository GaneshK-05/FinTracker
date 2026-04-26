import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, getSummary } from '../services/api';
import toast from 'react-hot-toast';
import { LuUser, LuMail, LuCalendar, LuSave, LuLogOut } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const formatCurrency = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Profile() {
  const { user, loginUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, sRes] = await Promise.all([getProfile(), getSummary()]);
        setProfileData(pRes.data.user);
        setName(pRes.data.user.name);
        setStats(sRes.data);
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const { data } = await updateProfile({ name: name.trim() });
      loginUser(localStorage.getItem('token'), data.user);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const joinDate = profileData?.created_at
    ? new Date(profileData.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="card profile-card animate-slide-up">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
          <div className="profile-meta">
            <span><LuCalendar /> Joined {joinDate}</span>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="profile-stats">
              <div className="profile-stat-item">
                <span className="profile-stat-value">{formatCurrency(stats.totalIncome)}</span>
                <span className="profile-stat-label">Income</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-value">{formatCurrency(stats.totalExpense)}</span>
                <span className="profile-stat-label">Expenses</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-value">{formatCurrency(stats.savings)}</span>
                <span className="profile-stat-label">Savings</span>
              </div>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="card-header">
            <h3 className="card-title">Edit Profile</h3>
          </div>
          <form onSubmit={handleSave}>
            <div className="input-group">
              <label className="input-label"><LuUser /> Full Name</label>
              <input
                className="input-field"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label"><LuMail /> Email</label>
              <input className="input-field" type="email" value={user?.email || ''} disabled />
              <small className="input-help">Email cannot be changed</small>
            </div>

            <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
              <LuSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <hr className="profile-divider" />

          <div>
            <h4 className="profile-section-title">Danger Zone</h4>
            <button className="btn btn-danger btn-block" onClick={handleLogout}>
              <LuLogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
