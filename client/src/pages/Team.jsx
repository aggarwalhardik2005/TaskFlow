import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiShield, FiAlertTriangle } from 'react-icons/fi';

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'admin';

  // Redirect members away from team management
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isAdmin) fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (!isAdmin) return null;

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiShield /> Team Management
            </h1>
            <p className="page-subtitle">{users.length} team member{users.length !== 1 ? 's' : ''} — Admin access only</p>
          </div>
        </div>
      </div>
      <div className="page-content">
        <div className="filters-bar">
          <div className="search-input">
            <FiSearch className="search-icon" />
            <input className="form-input" placeholder="Search members..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="member-list">
          {filtered.map(u => (
            <div key={u._id} className="member-item">
              <div className="member-info">
                <div className="user-avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>
                    {u.name} {u._id === currentUser?._id && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(you)</span>}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="member-actions" style={{ alignItems: 'center' }}>
                <span className={`badge badge-${u.role}`}>{u.role}</span>
                {u._id !== currentUser._id && (
                  <>
                    <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                      className="form-select" style={{ fontSize: '12px', padding: '4px 8px', width: 'auto', minWidth: '100px' }}>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
