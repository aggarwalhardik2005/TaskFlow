import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiClock } from 'react-icons/fi';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const { data } = await api.get('/tasks', { params });
      setTasks(data);
    } catch (err) { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [filters.status, filters.priority]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Task status updated successfully');
      fetchTasks();
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">All Tasks</h1>
        <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} across all projects</p>
      </div>
      <div className="page-content">
        <div className="filters-bar">
          <form onSubmit={handleSearch} className="search-input">
            <FiSearch className="search-icon" />
            <input className="form-input" placeholder="Search tasks..." value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })} />
          </form>
          <select className="form-select filter-select" value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          <select className="form-select filter-select" value={filters.priority}
            onChange={e => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No tasks found</div>
            <div className="empty-state-desc">Try adjusting your filters or create tasks in a project</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      {task.description && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {task.description.substring(0, 60)}{task.description.length > 60 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td>
                      {task.project && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: task.project.color, display: 'inline-block' }} />
                          {task.project.name}
                        </span>
                      )}
                    </td>
                    <td>
                      {task.assignedTo ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <span className="user-avatar" style={{ width: 22, height: 22, fontSize: 10 }}>
                            {task.assignedTo.name?.[0]}
                          </span>
                          {task.assignedTo.name}
                        </span>
                      ) : <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                    <td>
                      {task.dueDate ? (
                        <span className={`task-card-due ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'overdue' : ''}`}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                          <FiClock size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                        className="form-select" style={{ fontSize: '12px', padding: '4px 8px', minWidth: '120px' }}>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
