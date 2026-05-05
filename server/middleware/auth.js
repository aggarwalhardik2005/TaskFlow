const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Project member check middleware
const projectMember = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.projectId || req.params.id || req.body.project;

    if (!projectId) {
      return next();
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isMember && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Access denied. Not a project member.' });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { protect, adminOnly, projectMember };
