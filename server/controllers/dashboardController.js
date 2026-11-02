const Lead = require('../models/Lead');
const Task = require('../models/Task');

// @desc    Get dashboard statistics using MongoDB aggregation pipelines
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Calculate Start and End of Today
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 2. Aggregate Leads statistics (excluding soft-deleted leads)
    const leadStatsPromise = Lead.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          qualifiedLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0],
            },
          },
          contactedLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Contacted'] }, 1, 0],
            },
          },
          newLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'New'] }, 1, 0],
            },
          },
          lostLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0],
            },
          },
        },
      },
    ]);

    // 3. Aggregate Task statistics (Tasks Due Today & Completed Tasks)
    const taskStatsPromise = Task.aggregate([
      {
        $facet: {
          tasksDueToday: [
            {
              $match: {
                dueDate: {
                  $gte: startOfToday,
                  $lte: endOfToday,
                },
              },
            },
            { $count: 'count' },
          ],
          completedTasks: [
            {
              $match: {
                status: 'Completed',
              },
            },
            { $count: 'count' },
          ],
          pendingTasks: [
            {
              $match: {
                status: 'Pending',
              },
            },
            { $count: 'count' },
          ],
          inProgressTasks: [
            {
              $match: {
                status: 'In Progress',
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]);

    // Execute aggregations in parallel
    const [leadResults, [taskResults]] = await Promise.all([
      leadStatsPromise,
      taskStatsPromise,
    ]);

    const leadData = leadResults[0] || {
      totalLeads: 0,
      qualifiedLeads: 0,
      contactedLeads: 0,
      newLeads: 0,
      lostLeads: 0,
    };

    const tasksDueToday =
      taskResults.tasksDueToday && taskResults.tasksDueToday.length > 0
        ? taskResults.tasksDueToday[0].count
        : 0;

    const completedTasks =
      taskResults.completedTasks && taskResults.completedTasks.length > 0
        ? taskResults.completedTasks[0].count
        : 0;

    const pendingTasks =
      taskResults.pendingTasks && taskResults.pendingTasks.length > 0
        ? taskResults.pendingTasks[0].count
        : 0;

    const inProgressTasks =
      taskResults.inProgressTasks && taskResults.inProgressTasks.length > 0
        ? taskResults.inProgressTasks[0].count
        : 0;

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully.',
      data: {
        totalLeads: leadData.totalLeads,
        qualifiedLeads: leadData.qualifiedLeads,
        tasksDueToday,
        completedTasks,
        // Additional useful status breakdowns
        breakdown: {
          leads: {
            new: leadData.newLeads,
            contacted: leadData.contactedLeads,
            qualified: leadData.qualifiedLeads,
            lost: leadData.lostLeads,
          },
          tasks: {
            pending: pendingTasks,
            inProgress: inProgressTasks,
            completed: completedTasks,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
