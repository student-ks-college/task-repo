import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../api';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // ─── Fetch tasks ────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (sortBy) params.sortBy = sortBy;

      const res = await tasksAPI.getAll(params);
      setTasks(res.data.tasks);
      setStats(res.data.stats);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, sortBy]);

  useEffect(() => {
    const delay = setTimeout(fetchTasks, 300);
    return () => clearTimeout(delay);
  }, [fetchTasks]);

  // ─── CRUD handlers ──────────────────────────────────────────────────────────
  const handleCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setStats((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch {
      alert('Failed to delete task.');
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await tasksAPI.update(task._id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data.task : t)));
      fetchTasks();
    } catch {
      alert('Failed to update task.');
    }
  };

  const handleModalSave = async (taskData) => {
    try {
      if (editingTask) {
        const res = await tasksAPI.update(editingTask._id, taskData);
        setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data.task : t)));
      } else {
        await tasksAPI.create(taskData);
        fetchTasks();
      }
      setModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      throw err;
    }
  };

  const handleClearCompleted = async () => {
    if (!window.confirm('Delete all completed tasks?')) return;
    try {
      await tasksAPI.clearCompleted();
      fetchTasks();
    } catch {
      alert('Failed to clear completed tasks.');
    }
  };

  const completedCount = stats.completed || 0;

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">✓</span>
          <span className="logo-text">SmartTasks</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Overview</div>
          <button
            className={`nav-item ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            <span className="nav-icon">◈</span> All Tasks
            <span className="nav-badge">{stats.total}</span>
          </button>
          <button
            className={`nav-item ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            <span className="nav-icon">○</span> Pending
            <span className="nav-badge">{stats.pending}</span>
          </button>
          <button
            className={`nav-item ${statusFilter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setStatusFilter('in-progress')}
          >
            <span className="nav-icon">◑</span> In Progress
            <span className="nav-badge">{stats.inProgress}</span>
          </button>
          <button
            className={`nav-item ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            <span className="nav-icon">●</span> Completed
            <span className="nav-badge">{stats.completed}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <div className="sidebar-actions">
            <button className="btn-icon" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
              {darkMode ? '☀' : '☾'}
            </button>
            <button className="btn-icon btn-danger" onClick={logout} title="Sign out">
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-left">
            <h1>
              {statusFilter === '' && 'All Tasks'}
              {statusFilter === 'pending' && 'Pending Tasks'}
              {statusFilter === 'in-progress' && 'In Progress'}
              {statusFilter === 'completed' && 'Completed Tasks'}
            </h1>
            <p className="header-subtitle">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="header-actions">
            {completedCount > 0 && (
              <button className="btn btn-ghost" onClick={handleClearCompleted}>
                Clear completed
              </button>
            )}
            <button className="btn btn-primary" onClick={handleCreate}>
              + New Task
            </button>
          </div>
        </header>

        {/* ─── Stats Bar ──────────────────────────────────────── */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value text-warning">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value text-info">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value text-success">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          {stats.total > 0 && (
            <>
              <div className="stat-divider" />
              <div className="stat-item progress-stat">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.round((stats.completed / stats.total) * 100)}%` }}
                  />
                </div>
                <span className="stat-label">
                  {Math.round((stats.completed / stats.total) * 100)}% done
                </span>
              </div>
            </>
          )}
        </div>

        {/* ─── Filters & Search ───────────────────────────────── */}
        <div className="filters-row">
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="filter-select">
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="createdAt">Newest First</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>

        {/* ─── Task List ──────────────────────────────────────── */}
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <h3>{search || statusFilter || priorityFilter ? 'No tasks match your filters' : 'No tasks yet'}</h3>
            <p>
              {search || statusFilter || priorityFilter
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'}
            </p>
            {!search && !statusFilter && !priorityFilter && (
              <button className="btn btn-primary" onClick={handleCreate}>
                + Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </main>

      {/* ─── Task Modal ───────────────────────────────────────── */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleModalSave}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
