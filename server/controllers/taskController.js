const Task = require('../models/Task');
const Lead = require('../models/Lead');
const User = require('../models/User');

// @desc    Get all tasks with optional status filter
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, assignedTo } = req.query;
    const query = {};

    if (status && ['Pending', 'In Progress', 'Completed'].includes(status)) {
      query.status = status;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate({
        path: 'lead',
        select: 'name email company isDeleted',
        populate: {
          path: 'company',
          select: 'name',
        },
      })
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully.',
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully.',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, lead, assignedTo, dueDate, status } = req.body;

    if (!title || !lead || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, lead, assignedTo, and dueDate.',
      });
    }

    // Check if lead exists and is not deleted
    const leadExists = await Lead.findOne({ _id: lead, isDeleted: false });
    if (!leadExists) {
      return res.status(404).json({
        success: false,
        message: 'Associated lead does not exist or has been deleted.',
      });
    }

    // Check if assigned user exists
    const userExists = await User.findById(assignedTo);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user does not exist.',
      });
    }

    const task = await Task.create({
      title,
      description: description || '',
      lead,
      assignedTo,
      dueDate,
      status: status || 'Pending',
    });

    const populatedTask = await Task.findById(task._id)
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status with strict assignment ownership enforcement
// @route   PATCH /api/tasks/:id/status
// @access  Private (Only assigned user)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // 1. Validate status value
    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${validStatuses.join(', ')}.`,
      });
    }

    // 2. Find the requested task
    const task = await Task.findById(req.params.id);

    // 3. Verify task exists
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // 4. Critical Ownership Enforcement: Compare task.assignedTo with authenticated user ID
    // Convert both to string for safe comparison
    const assignedUserId = task.assignedTo.toString();
    const currentUserId = req.user._id.toString();

    if (assignedUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the user assigned to this task can update its status.',
      });
    }

    // 5. Update and save
    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully.',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
};
