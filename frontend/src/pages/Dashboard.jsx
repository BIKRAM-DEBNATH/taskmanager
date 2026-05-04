import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const StatusBadge = ({ status }) => {
  const map = {
    pending: 'badge-pending',
    'in-progress': 'badge-in-progress',
    completed: 'badge-completed',
  };
  const labels = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };
  return <span className={`badge ${map[status] || ''}`}>{labels[status] || status}</span>;
};

const PriorityBadge = ({ priority }) => {
  const map = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
  return <span className={`badge ${map[priority] || ''}`}>{priority}</span>;
};

function isOverdue(task) {
  if (!task.dueDate || task.status === 'completed') return false;
  return new Date() > new Date(task.dueDate);
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, tasksRes, projectsRes] = await Promise.all([
          api.get('/tasks/stats'),
          api.get('/tasks'),
          api.get('/projects'),
        ]);
        setStats(statsRes.data.stats);
        setTasks(tasksRes.data.tasks.slice(0, 10));
        setProjects(projectsRes.data.projects.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="loading-wrap"><div className="spinner"></div></div>
  );

  const overdueTasks = tasks.filter(isOverdue);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">Here's what's happening with your team today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats?.total ?? 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>{stats?.pending ?? 0}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{stats?.inProgress ?? 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{stats?.completed ?? 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className={`stat-card ${stats?.overdue > 0 ? 'overdue' : ''}`}>
          <div className="stat-icon">🔴</div>
          <div className="stat-value">{stats?.overdue ?? 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Recent Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
              Recent Tasks
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>
              View all →
            </button>
          </div>

          {overdueTasks.length > 0 && (
            <div className="alert alert-error mb-4">
              <span>⚠</span>
              You have <strong>{overdueTasks.length}</strong> overdue task{overdueTasks.length !== 1 ? 's' : ''}!
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No tasks yet</div>
              <div className="empty-desc">
                {isAdmin ? 'Create projects and assign tasks to get started.' : 'No tasks assigned to you yet.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map(task => (
                <div
                  key={task._id}
                  className={`task-card ${isOverdue(task) ? 'overdue' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/tasks')}
                >
                  <div className="task-card-header">
                    <div className="task-card-title">{task.title}</div>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="task-card-meta">
                    <PriorityBadge priority={task.priority} />
                    {task.project && (
                      <span className="task-card-project">◫ {task.project.name}</span>
                    )}
                    {isOverdue(task) && <span className="badge badge-overdue">Overdue</span>}
                    {task.dueDate && (
                      <span className="text-xs text-muted">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
              {isAdmin ? 'All Projects' : 'My Projects'}
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
              View all →
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◫</div>
              <div className="empty-title">No projects yet</div>
              <div className="empty-desc">
                {isAdmin ? 'Create your first project to get started.' : 'You haven\'t been assigned to any projects.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projects.map(project => (
                <div
                  key={project._id}
                  className="card-sm"
                  style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{project.name}</div>
                    <span className={`badge badge-${project.status}`}>{project.status}</span>
                  </div>
                  {project.description && (
                    <div className="text-sm text-muted" style={{ marginBottom: 8 }}>
                      {project.description.slice(0, 80)}{project.description.length > 80 ? '...' : ''}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                    </span>
                    {project.dueDate && (
                      <span className="text-xs text-muted">
                        · Due {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
