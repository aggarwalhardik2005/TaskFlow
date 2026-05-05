const express = require('express');
const router = express.Router();
const {
  getTasks, getTask, createTask, updateTask,
  updateTaskStatus, deleteTask, getDashboardStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').get(protect, getTask).put(protect, updateTask).delete(protect, deleteTask);
router.patch('/:id/status', protect, updateTaskStatus);

module.exports = router;
