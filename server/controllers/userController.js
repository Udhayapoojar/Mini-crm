const User = require('../models/User');

// @desc    Get all users for assignment dropdowns
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('_id name email role').sort({ name: 1 });
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
};
