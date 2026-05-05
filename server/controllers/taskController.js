const Task = require('../models/Task');
const Project = require('../models/Project');

const getTasks = async (req, res) => {
  try {
    const { status, priority, project, assignedTo, search, sortBy } = req.query;
    let filter = {};

    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      filter.project = { $in: projectIds };
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.title = { $regex: search, $options: 'i' };

    let sort = '-createdAt';
    if (sortBy === 'dueDate') sort = 'dueDate';
    if (sortBy === 'priority') sort = '-priority';
    if (sortBy === 'status') sort = 'status';

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color')
      .sort(sort);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, tags } = req.body;
    if (!title || !project) return res.status(400).json({ message: 'Title and project are required' });

    const projectDoc = await Project.findById(project);
    if (!projectDoc) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title, description: description || '', project, assignedTo: assignedTo || null,
      createdBy: req.user._id, priority: priority || 'medium',
      dueDate: dueDate || null, tags: tags || [],
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, assignedTo, status, priority, dueDate, tags } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags) task.tags = tags;

    await task.save();
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (!isCreator && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    let projectFilter = {};
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      }).select('_id');
      projectFilter = { project: { $in: userProjects.map((p) => p._id) } };
    }

    const totalTasks = await Task.countDocuments(projectFilter);
    const statusCounts = await Task.aggregate([
      { $match: projectFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const priorityCounts = await Task.aggregate([
      { $match: projectFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const now = new Date();
    const overdueTasks = await Task.find({
      ...projectFilter, dueDate: { $lt: now }, status: { $ne: 'done' },
    })
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color')
      .sort('dueDate')
      .limit(10);

    const recentTasks = await Task.find(projectFilter)
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color')
      .sort('-createdAt')
      .limit(5);

    let totalProjects;
    if (req.user.role === 'admin') {
      totalProjects = await Project.countDocuments();
    } else {
      totalProjects = await Project.countDocuments({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      });
    }

    const totalMembers = await require('../models/User').countDocuments();

    const stats = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
    statusCounts.forEach((s) => { stats[s._id] = s.count; });

    const priorities = { low: 0, medium: 0, high: 0, critical: 0 };
    priorityCounts.forEach((p) => { priorities[p._id] = p.count; });

    res.json({
      totalTasks, totalProjects, totalMembers,
      statusCounts: stats, priorityCounts: priorities,
      overdueTasks, recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, updateTaskStatus, deleteTask, getDashboardStats };
