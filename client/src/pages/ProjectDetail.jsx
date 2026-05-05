import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiX, FiArrowLeft, FiUserPlus, FiTrash2, FiClock } from 'react-icons/fi';

const STATUSES = [
  { key: 'todo', label: 'To Do', color: '#9ca3af' },
  { key: 'in-progress', label: 'In Progress', color: '#60a5fa' },
  { key: 'review', label: 'Review', color: '#fbbf24' },
  { key: 'done', label: 'Done', color: '#34d399' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (err) {
      toast.error('Project not found');
      navigate('/projects');
    } finally { setLoading(false); }
  };

  const fetchMembers = async () => {
    try { const { data } = await api.get('/users'); setMembers(data); } catch (err) {}
  };

  useEffect(() => { fetchProject(); fetchMembers(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title) return toast.error('Title is required');
    setSubmitting(true);
    try {
      await api.post('/tasks', { ...taskForm, project: id, assignedTo: taskForm.assignedTo || undefined });
      toast.success('Task created!');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
      fetchProject();
    } catch (err) { toast.error('Failed to create task'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Task status updated successfully');
      fetchProject();
    } catch (err) { toast.error('Failed to update'); }
  };

  const handleDeleteTask = async (taskId) => {
    try { await api.delete(`/tasks/${taskId}`); toast.success('Deleted'); fetchProject(); }
    catch (err) { toast.error('Failed'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail) return toast.error('Enter email');
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      toast.success('Member added!');
      setMemberEmail('');
      setShowMemberModal(false);
      fetchProject();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveMember = async (userId) => {
    try { await api.delete(`/projects/${id}/members/${userId}`); toast.success('Removed'); fetchProject(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!project) return null;

  const isAdmin = user?.role === 'admin';
  const isOwner = project.owner?._id === user?._id;
  const isOwnerOrAdmin = isAdmin || isOwner;
  const tasks = project.tasks || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-icon" onClick={() => navigate('/projects')}><FiArrowLeft /></button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: project.color }} />
                <h1 className="page-title">{project.name}</h1>
                <span className={`badge badge-${project.status}`}>{project.status}</span>
              </div>
              <p className="page-subtitle">{project.description}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Only Admins can manage members */}
            {isAdmin && (
              <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
                <FiUserPlus /> Add Member
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              <FiPlus /> Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Members */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' }}>Members:</span>
          {project.members?.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '12px' }}>
              <div className="user-avatar" style={{ width: 22, height: 22, fontSize: 10 }}>{m.user?.name?.[0]}</div>
              <span>{m.user?.name}</span>
              <span className={`badge badge-${m.role}`} style={{ fontSize: 9, padding: '1px 6px' }}>{m.role}</span>
              {/* Only Admins can remove members */}
              {isAdmin && m.user?._id !== project.owner?._id && (
                <button onClick={() => handleRemoveMember(m.user?._id)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0 }}>
                  <FiX size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="kanban-board">
          {STATUSES.map(status => {
            const columnTasks = tasks.filter(t => t.status === status.key);
            return (
              <div key={status.key} className="kanban-column">
                <div className="kanban-column-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: status.color }} />
                    <span className="kanban-column-title">{status.label}</span>
                  </div>
                  <span className="kanban-column-count">{columnTasks.length}</span>
                </div>
                <div className="kanban-tasks">
                  {columnTasks.map(task => (
                    <div key={task._id} className="task-card">
                      <div className="task-card-header">
                        <span className="task-card-title">{task.title}</span>
                        {/* Only Admin or task creator can delete */}
                        {(isAdmin || task.createdBy?._id === user?._id) && (
                        <button onClick={() => handleDeleteTask(task._id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}>
                          <FiTrash2 size={12} />
                        </button>
                        )}
                      </div>
                      {task.description && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          {task.description.substring(0, 80)}{task.description.length > 80 ? '...' : ''}
                        </p>
                      )}
                      <div className="task-card-meta">
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        {task.dueDate && (
                          <span className={`task-card-due ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'overdue' : ''}`}>
                            <FiClock size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                        {task.assignedTo ? (
                          <span className="task-card-assignee">
                            <span className="user-avatar" style={{ width: 20, height: 20, fontSize: 9 }}>{task.assignedTo.name?.[0]}</span>
                            {task.assignedTo.name}
                          </span>
                        ) : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unassigned</span>}
                        {/* Members can only change status if assigned to them, Admins can change any */}
                        {(isAdmin || task.assignedTo?._id === user?._id) ? (
                          <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                            style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--bg-input)', border: '1px solid var(--border)',
                              borderRadius: '4px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                          </select>
                        ) : (
                          <span className={`badge badge-${task.status}`}>{task.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Task</h2>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" placeholder="Task title"
                    value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Describe the task..."
                    value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select className="form-select" value={taskForm.assignedTo}
                      onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                      <option value="">Unassigned</option>
                      {project.members?.map((m, i) => (
                        <option key={i} value={m.user?._id}>{m.user?.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={taskForm.priority}
                      onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input"
                    value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Member</h2>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">User Email</label>
                  <input className="form-input" type="email" placeholder="user@example.com"
                    value={memberEmail} onChange={e => setMemberEmail(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
