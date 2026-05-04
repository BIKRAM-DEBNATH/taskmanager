const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  getTaskStats,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect); // All task routes require login

router.get('/stats', getTaskStats);

router.route('/')
  .get(getTasks)
  .post(adminOnly, createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(adminOnly, deleteTask);

module.exports = router;
