const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for logged-in user (with search & filter)
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Build query filter
  const filter = { userId: req.user._id };

  if (status && ['pending', 'in-progress', 'completed'].includes(status)) {
    filter.status = status;
  }

  if (priority && ['low', 'medium', 'high'].includes(priority)) {
    filter.priority = priority;
  }

  // Text search on title and description
  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  // Sorting
  const sortOrder = order === 'asc' ? 1 : -1;
  const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'dueDate', 'priority'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const tasks = await Task.find(filter)
    .sort({ [sortField]: sortOrder })
    .lean();

  // Stats summary
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  res.status(200).json({
    success: true,
    count: tasks.length,
    stats,
    tasks,
  });
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task
 * @access  Private
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  res.status(200).json({ success: true, task });
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, tags } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Task title is required',
    });
  }

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || '',
    status: status || 'pending',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    tags: Array.isArray(tags) ? tags : [],
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    task,
  });
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
  // Find task belonging to this user
  let task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  const { title, description, status, priority, dueDate, tags } = req.body;

  // Only update provided fields
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (tags !== undefined) task.tags = Array.isArray(tags) ? tags : [];

  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    task,
  });
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    taskId: req.params.id,
  });
});

/**
 * @route   DELETE /api/tasks
 * @desc    Delete all completed tasks
 * @access  Private
 */
const clearCompleted = asyncHandler(async (req, res) => {
  const result = await Task.deleteMany({
    userId: req.user._id,
    status: 'completed',
  });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} completed task(s) deleted`,
    deletedCount: result.deletedCount,
  });
});

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, clearCompleted };
