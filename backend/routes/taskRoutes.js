const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  clearCompleted,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// All task routes are protected
router.use(protect);

// GET    /api/tasks           → Get all tasks (supports ?search=&status=&priority=)
// POST   /api/tasks           → Create a task
router.route('/').get(getTasks).post(createTask);

// DELETE /api/tasks/clear     → Delete all completed tasks
router.delete('/clear', clearCompleted);

// GET    /api/tasks/:id       → Get single task
// PUT    /api/tasks/:id       → Update task
// DELETE /api/tasks/:id       → Delete task
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);

module.exports = router;
