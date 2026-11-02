const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById);

// Strictly protected route enforcing task assignee authorization in controller
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
