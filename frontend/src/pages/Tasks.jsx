import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function isOverdue(task) {
  if (!task.dueDate || task.status === 'completed') return false;
  return new Date() > new Date(task.dueDate);
}

function TaskModal({ task, projects, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    projectId: task?.project?._id || task?.project || '',
    assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Task title is required'); return; }
    if (!form.projectId) { setError('Please select a project'); return; }
    try {
      setLoading(true);
      const payload = { ...form, assignedTo: form.assignedTo || null };
      if (task?._id) {
        await api.put(`/tasks/${task._id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input name="title" className="form-input" value={form.title} onChange={handleChange} placeholder="e.g. Design landing page mockup" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} placeholder="Task details..." />
          </div>
          <div className="form-group">
            <label className="form-label">Project *</label>
            <select name="projectId" className="form-select" value={form.projectId} onChange={handleChange}>
              <option value="">Select a project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select name="assignedTo" className="form-select" value={form.assignedTo} onChange={handleChange}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select name="priority" className="form-select" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input type="date" name="dueDate" className="form-input" value={form.dueDate} onChange={handleChange} />
          </div>
          <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusUpdateModal({ task, onClose, onSaved }) {
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put(`/tasks/${task._id}`, { status });
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div className="modal-header">
          <h2 className="modal-title">Update Status</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p className="text-sm text-secondary mb-4">{task.title}</p>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { isAdmin } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [statusTask, setStatusTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      const res = await api.get(`/tasks?${params}`);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    api.get('/projects').then(r => setProjects(r.data.projects)).catch(() => {});
    if (isAdmin) {
      api.get('/users').then(r => setUsers(r.data.users)).catch(() => {});
    }
  }, [isAdmin, filters.status, filters.priority]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditTask(null);
    setStatusTask(null);
    fetchTasks();
  };

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    t.project?.name?.toLowerCase().includes(filters.search.toLowerCase())
  );

  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
            + New Task
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-input-wrap" style={{ flex: 1, maxWidth: 280 }}>
          <span className="search-icon">⌕</span>
          <input
            className="form-input"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filters.status}
          onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filters.priority}
          onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
        >
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(filters.status || filters.priority || filters.search) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setFilters({ status: '', priority: '', search: '' })}
          >
            Clear ×
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <div className="empty-title">No tasks found</div>
          <div className="empty-desc">
            {isAdmin ? 'Create your first task to get started.' : 'No tasks assigned to you yet.'}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(task => {
                  const overdue = isOverdue(task);
                  return (
                    <tr key={task._id} style={overdue ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                            {task.description.slice(0, 50)}{task.description.length > 50 ? '...' : ''}
                          </div>
                        )}
                        {overdue && (
                          <span className="badge badge-overdue" style={{ marginTop: 4 }}>Overdue</span>
                        )}
                      </td>
                      <td>
                        <span className="text-sm text-secondary">{task.project?.name || '—'}</span>
                      </td>
                      <td>
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {task.assignedTo.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm">{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted">Unassigned</span>
                        )}
                      </td>
                      <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                      <td className="text-sm text-secondary">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <span
                          className={`badge ${task.status === 'pending' ? 'badge-pending' : task.status === 'in-progress' ? 'badge-in-progress' : 'badge-completed'}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setStatusTask(task)}
                          title="Click to update status"
                        >
                          {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {isAdmin && (
                            <>
                              <button
                                className="btn btn-ghost btn-sm btn-icon"
                                title="Edit"
                                onClick={() => { setEditTask(task); setShowModal(true); }}
                              >✎</button>
                              <button
                                className="btn btn-danger btn-sm btn-icon"
                                title="Delete"
                                onClick={() => handleDelete(task._id)}
                              >⌫</button>
                            </>
                          )}
                          {!isAdmin && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setStatusTask(task)}
                            >
                              Update
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && isAdmin && (
        <TaskModal
          task={editTask}
          projects={projects}
          users={users}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSaved={handleSaved}
        />
      )}

      {statusTask && (
        <StatusUpdateModal
          task={statusTask}
          onClose={() => setStatusTask(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
