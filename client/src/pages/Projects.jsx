import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiX } from 'react-icons/fi';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', deadline: '', color: '#6366f1' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const colors = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#3b82f6','#06b6d4'];

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) return toast.error('Name and description required');
    setSubmitting(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '', deadline: '', color: '#6366f1' });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Deleted');
      fetchProjects();
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button id="create-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> New Project
          </button>
        </div>
      </div>
      <div className="page-content">
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <div className="empty-state-title">No projects yet</div>
            <div className="empty-state-desc">Create your first project to get started</div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Project</button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(p => {
              const progress = p.taskCounts?.total > 0
                ? Math.round((p.taskCounts.done / p.taskCounts.total) * 100) : 0;
              return (
                <div key={p._id} className="project-card" style={{ '--project-color': p.color }}
                  onClick={() => navigate(`/projects/${p._id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="project-card-title">{p.name}</h3>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                  </div>
                  <p className="project-card-desc">{p.description}</p>
                  <div className="project-card-stats">
                    <div className="project-card-stat">
                      <div className="project-card-stat-value">{p.taskCounts?.total || 0}</div>
                      <div className="project-card-stat-label">Tasks</div>
                    </div>
                    <div className="project-card-stat">
                      <div className="project-card-stat-value">{p.taskCounts?.done || 0}</div>
                      <div className="project-card-stat-label">Done</div>
                    </div>
                    <div className="project-card-stat">
                      <div className="project-card-stat-value" style={{ color: 'var(--success)' }}>{progress}%</div>
                      <div className="project-card-stat-label">Progress</div>
                    </div>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%`, background: p.color }} /></div>
                  <div className="project-card-footer" style={{ marginTop: '16px' }}>
                    <div className="project-card-members">
                      {p.members?.slice(0, 4).map((m, i) => (
                        <div key={i} className="user-avatar">{m.user?.name?.[0] || '?'}</div>
                      ))}
                      {p.members?.length > 4 && <div className="user-avatar">+{p.members.length - 4}</div>}
                    </div>
                    {(user?.role === 'admin' || p.owner?._id === user?._id) && (
                      <button className="btn btn-ghost btn-sm" onClick={(e) => handleDelete(p._id, e)}
                        style={{ color: 'var(--danger)' }}>Delete</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input className="form-input" placeholder="My Awesome Project"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Describe your project..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input type="date" className="form-input"
                      value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {colors.map(c => (
                        <div key={c} onClick={() => setForm({ ...form, color: c })}
                          style={{
                            width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                            border: form.color === c ? '3px solid white' : '3px solid transparent',
                            transition: 'all 0.2s'
                          }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
