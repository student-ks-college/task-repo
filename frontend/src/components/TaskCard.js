import React from 'react';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
const STATUS_LABELS = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };

const TaskCard = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const isOverdue =
    task.dueDate &&
    task.status !== 'completed' &&
    new Date(task.dueDate) < new Date();

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`task-card priority-${task.priority} ${task.status === 'completed' ? 'completed' : ''}`}>
      <div className="task-card-header">
        <button
          className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
          onClick={() => onToggleStatus(task)}
          title={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.status === 'completed' ? '✓' : ''}
        </button>

        <div className="task-meta">
          <span
            className="priority-dot"
            style={{ background: PRIORITY_COLORS[task.priority] }}
            title={`${task.priority} priority`}
          />
          <span className={`status-badge status-${task.status}`}>
            {STATUS_LABELS[task.status]}
          </span>
        </div>
      </div>

      <div className="task-body">
        <h3 className={`task-title ${task.status === 'completed' ? 'strikethrough' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>

      <div className="task-card-footer">
        <div className="task-tags-row">
          {task.dueDate && (
            <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
              {isOverdue ? '⚠ ' : '📅 '}
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.tags?.map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>

        <div className="task-actions">
          <button className="task-action-btn edit-btn" onClick={() => onEdit(task)} title="Edit task">
            ✎
          </button>
          <button className="task-action-btn delete-btn" onClick={() => onDelete(task._id)} title="Delete task">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
