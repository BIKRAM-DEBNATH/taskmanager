const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect); // All project routes require login

router.route('/')
  .get(getProjects)
  .post(adminOnly, createProject);

router.route('/:id')
  .get(getProject)
  .put(adminOnly, updateProject)
  .delete(adminOnly, deleteProject);

module.exports = router;
