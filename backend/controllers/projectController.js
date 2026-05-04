const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create a project
// @route   POST /api/projects
// @access  Admin
const createProject = async (req, res) => {
  try {
    const { name, description, dueDate, members } = req.body;

    if (!name) return res.status(400).json({ message: 'Project name is required' });

    // Validate members exist
    if (members && members.length > 0) {
      const validUsers = await User.countDocuments({ _id: { $in: members } });
      if (validUsers !== members.length) {
        return res.status(400).json({ message: 'One or more member IDs are invalid' });
      }
    }

    const project = await Project.create({
      name,
      description,
      dueDate,
      members: members || [],
      createdBy: req.user._id,
    });

    await project.populate(['createdBy', 'members']);
    res.status(201).json({ message: 'Project created', project });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// @desc    Get all projects (admin) or assigned projects (member)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Project.find();
    } else {
      query = Project.find({ members: req.user._id });
    }

    const projects = await query
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Members can only view their own projects
    if (
      req.user.role !== 'admin' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching project' });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Admin
const updateProject = async (req, res) => {
  try {
    const { name, description, status, dueDate, members } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (dueDate !== undefined) project.dueDate = dueDate;
    if (members) project.members = members;

    await project.save();
    await project.populate(['createdBy', 'members']);
    res.json({ message: 'Project updated', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating project' });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Delete all tasks in this project
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project and its tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting project' });
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject };
