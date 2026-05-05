import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiCheckSquare, FiFolder, FiUsers, FiAlertTriangle, FiClock, FiTrendingUp } from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/tasks/dashboard');
        setStats(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const completionRate = stats?.totalTasks > 0
    ? Math.round((stats.statusCounts.done / stats.totalTasks) * 100) : 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your projects and tasks</p>
      </div>
      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple"><FiCheckSquare /></div>
            <div className="stat-value">{stats?.totalTasks || 0}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><FiFolder /></div>
            <div className="stat-value">{stats?.totalProjects || 0}</div>
            <div className="stat-label">Projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FiUsers /></div>
            <div className="stat-value">{stats?.totalMembers || 0}</div>
            <div className="stat-label">Team Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><FiTrendingUp /></div>
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${completionRate}%` }} /></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Status Breakdown */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Task Status</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'To Do', key: 'todo', color: '#9ca3af', icon: '○' },
                { label: 'In Progress', key: 'in-progress', color: '#60a5fa', icon: '◐' },
                { label: 'Review', key: 'review', color: '#fbbf24', icon: '◑' },
                { label: 'Done', key: 'done', color: '#34d399', icon: '●' },
              ].map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: s.color, fontSize: '16px' }}>{s.icon}</span>
                    <span style={{ fontSize: '14px' }}>{s.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, marginLeft: '20px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', background: s.color, borderRadius: '3px',
                        width: stats?.totalTasks ? `${(stats.statusCounts[s.key] / stats.totalTasks) * 100}%` : '0%',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, minWidth: '24px', textAlign: 'right' }}>
                      {stats?.statusCounts?.[s.key] || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Priority Distribution</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Critical', key: 'critical', color: '#f87171' },
                { label: 'High', key: 'high', color: '#fbbf24' },
                { label: 'Medium', key: 'medium', color: '#60a5fa' },
                { label: 'Low', key: 'low', color: '#9ca3af' },
              ].map(p => (
                <div key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    {p.label}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{stats?.priorityCounts?.[p.key] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overdue Tasks */}
        {stats?.overdueTasks?.length > 0 && (
          <div className="card" style={{ marginTop: '20px', borderColor: 'rgba(239,68,68,0.3)' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiAlertTriangle /> Overdue Tasks ({stats.overdueTasks.length})
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.overdueTasks.map(task => (
                <div key={task._id} className="task-card" onClick={() => navigate('/tasks')}>
                  <div className="task-card-header">
                    <span className="task-card-title">{task.title}</span>
                    <span className={`badge badge-${task.priority || 'medium'}`}>{task.priority}</span>
                  </div>
                  <div className="task-card-meta">
                    <span className="task-card-due overdue">
                      <FiClock size={12} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    {task.project && <span className="badge badge-active">{task.project.name}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Tasks */}
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3 className="card-title">Recent Tasks</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>View All</button>
          </div>
          {stats?.recentTasks?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.recentTasks.map(task => (
                <div key={task._id} className="task-card">
                  <div className="task-card-header">
                    <span className="task-card-title">{task.title}</span>
                    <span className={`badge badge-${task.status}`}>{task.status}</span>
                  </div>
                  <div className="task-card-meta">
                    {task.assignedTo && (
                      <span className="task-card-assignee">
                        <span className="user-avatar" style={{ width: 20, height: 20, fontSize: 9 }}>
                          {task.assignedTo.name?.[0]}
                        </span>
                        {task.assignedTo.name}
                      </span>
                    )}
                    {task.project && <span className="badge badge-active" style={{ fontSize: 10 }}>{task.project.name}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No tasks yet</div>
              <div className="empty-state-desc">Create a project and start adding tasks</div>
              <button className="btn btn-primary" onClick={() => navigate('/projects')}>Create Project</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
