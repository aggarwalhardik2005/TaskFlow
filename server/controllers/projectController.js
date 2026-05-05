const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const getProjects = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Project.find();
    } else {
      query = Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      });
    }
    const projects = await query
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort('-createdAt');

    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const counts = { total: 0, todo: 0, 'in-progress': 0, review: 0, done: 0 };
        taskCounts.forEach((tc) => { counts[tc._id] = tc.count; counts.total += tc.count; });
        return { ...project.toObject(), taskCounts: counts };
      })
    );
    res.json(projectsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!isOwner && !isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');
    res.json({ ...project.toObject(), tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, deadline, color, members } = req.body;
    if (!name || !description) return res.status(400).json({ message: 'Please provide name and description' });

    const project = await Project.create({
      name, description, owner: req.user._id,
      deadline: deadline || null, color: color || '#6366f1', members: members || [],
    });
    project.members.push({ user: req.user._id, role: 'admin' });
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const { name, description, status, deadline, color } = req.body;
    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (deadline !== undefined) project.deadline = deadline;
    if (color) project.color = color;

    await project.save();
    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const { email, role } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide user email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyMember = project.members.some((m) => m.user.toString() === user._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({ user: user._id, role: role || 'member' });
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    if (req.params.userId === project.owner.toString()) return res.status(400).json({ message: 'Cannot remove owner' });

    project.members = project.members.filter((m) => m.user.toString() !== req.params.userId);
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember };
