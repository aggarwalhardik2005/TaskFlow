import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password && form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await api.put('/auth/profile', payload);
      updateUser(data);
      toast.success('Profile updated!');
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account settings</p>
      </div>
      <div className="page-content">
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div className="user-avatar" style={{ width: 64, height: 64, fontSize: 24 }}>{initials}</div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{user?.name}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user?.email}</p>
                <span className={`badge badge-${user?.role}`} style={{ marginTop: '4px' }}>{user?.role}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '20px' }}>Update Profile</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" placeholder="Leave blank to keep"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" placeholder="Confirm new password"
                    value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
