import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function StatusBadge({ status }) {
  const map = { pending: 'badge-pending', 'in-progress': 'badge-in-progress', completed: 'badge-completed' };
  const labels = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };
  return <span className={`badge ${map[status] || ''}`}>{labels[status] || status}</span>;
}

function isOverdue(task) {
  if (!task.dueDate || task.status === 'completed') return false;
  return new Date() > new Date(task.dueDate);
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
      ]);
      setProject(projRes.data.project);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task');
    }
  };

  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>;
  if (error) return (
    <div>
      <div className="alert alert-error"><span>⚠</span> {error}</div>
      <button className="btn btn-secondary" onClick={() => navigate('/projects')}>← Back to Projects</button>
    </div>
  );
  if (!project) return null;

  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="fade-in">
      <div className="flex items-center gap-3 mb-2">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
          ← Projects
        </button>
      </div>

      <div className="page-header">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="page-title">{project.name}</h1>
            <span className={`badge badge-${project.status}`}>{project.status}</span>
          </div>
          {project.description && (
            <p className="page-subtitle">{project.description}</p>
          )}
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate(`/tasks?project=${id}`)}>
            + Add Tasks
          </button>
        )}
      </div>

      {/* Project info */}
      <div className="grid-3 mb-4" style={{ gap: 12 }}>
        <div className="card-sm">
          <div className="text-xs text-muted mb-1">Created by</div>
          <div className="text-sm font-medium">{project.createdBy?.name}</div>
        </div>
        <div className="card-sm">
          <div className="text-xs text-muted mb-1">Due Date</div>
          <div className="text-sm font-medium">
            {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No deadline'}
          </div>
        </div>
        <div className="card-sm">
          <div className="text-xs text-muted mb-1">Members</div>
          <div className="text-sm font-medium">{project.members?.length || 0} assigned</div>
        </div>
      </div>

      {/* Members */}
      {project.members?.length > 0 && (
        <div className="card mb-4">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
            Team Members
          </h3>
          <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
            {project.members.map(m => (
              <div key={m._id} className="flex items-center gap-2" style={{ background: 'var(--surface-2)', padding: '6px 12px', borderRadius: 99, fontSize: 13 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {m.name?.[0]?.toUpperCase()}
                </div>
                {m.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Stats */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: tasks.length, color: 'var(--text-primary)' },
          { label: 'Pending', value: pending, color: 'var(--yellow)' },
          { label: 'In Progress', value: inProgress, color: 'var(--blue)' },
          { label: 'Completed', value: completed, color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} className="card-sm flex items-center gap-3" style={{ flex: '1 1 100px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
            <div className="text-sm text-secondary">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tasks Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
            Tasks ({tasks.length})
          </h3>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <div className="empty-title">No tasks yet</div>
            <div className="empty-desc">
              {isAdmin ? 'Go to Tasks to create tasks for this project.' : 'No tasks assigned in this project.'}
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id} style={isOverdue(task) ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                          {task.description.slice(0, 60)}{task.description.length > 60 ? '...' : ''}
                        </div>
                      )}
                      {isOverdue(task) && <span className="badge badge-overdue" style={{ marginTop: 4 }}>Overdue</span>}
                    </td>
                    <td>
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                            {task.assignedTo.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm">{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    </td>
                    <td className="text-sm text-secondary">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}
                        value={task.status}
                        onChange={e => handleStatusChange(task._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
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
