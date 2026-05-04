import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function ProjectModal({ project, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active',
    dueDate: project?.dueDate ? project.dueDate.slice(0, 10) : '',
    members: project?.members?.map(m => m._id || m) || [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleMember = (id) => {
    setForm(prev => ({
      ...prev,
      members: prev.members.includes(id)
        ? prev.members.filter(m => m !== id)
        : [...prev.members, id],
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required'); return; }
    try {
      setLoading(true);
      if (project?._id) {
        await api.put(`/projects/${project._id}`, form);
      } else {
        await api.post('/projects', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{project ? 'Edit Project' : 'New Project'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="e.g. Website Redesign" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} placeholder="What is this project about?" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" name="dueDate" className="form-input" value={form.dueDate} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign Members</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', padding: 4 }}>
              {users.map(u => (
                <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 0' }}>
                  <input
                    type="checkbox"
                    checked={form.members.includes(u._id)}
                    onChange={() => toggleMember(u._id)}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: 14 }}>{u.name}</span>
                  <span className="text-xs text-muted">{u.email}</span>
                  <span className={`badge badge-${u.role}`} style={{ marginLeft: 'auto' }}>{u.role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (isAdmin) {
      api.get('/users').then(res => setUsers(res.data.users)).catch(() => {});
    }
  }, [isAdmin]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditProject(null);
    fetchProjects();
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
            + New Project
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-input-wrap" style={{ flex: 1, maxWidth: 300 }}>
          <span className="search-icon">⌕</span>
          <input
            className="form-input"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◫</div>
          <div className="empty-title">No projects found</div>
          <div className="empty-desc">
            {isAdmin ? 'Create your first project to get started.' : 'You haven\'t been assigned to any projects yet.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(project => (
            <div
              key={project._id}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/projects/${project._id}`)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`badge badge-${project.status}`}>{project.status}</span>
                {isAdmin && (
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      title="Edit"
                      onClick={() => { setEditProject(project); setShowModal(true); }}
                    >✎</button>
                    <button
                      className="btn btn-danger btn-sm btn-icon"
                      title="Delete"
                      onClick={() => handleDelete(project._id)}
                    >⌫</button>
                  </div>
                )}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-secondary" style={{ marginBottom: 12 }}>
                  {project.description.slice(0, 100)}{project.description.length > 100 ? '...' : ''}
                </p>
              )}
              <div className="flex items-center gap-3" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <span className="text-xs text-muted">
                  {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                </span>
                {project.dueDate && (
                  <span className="text-xs text-muted">
                    Due {new Date(project.dueDate).toLocaleDateString()}
                  </span>
                )}
                <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>
                  by {project.createdBy?.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          users={users}
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
