const Lead = require('../models/Lead');
const Company = require('../models/Company');
const User = require('../models/User');

// @desc    Get all leads with pagination, search, and status filter
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, status } = req.query;

    // Base query: always exclude soft-deleted leads
    const query = { isDeleted: false };

    // Status filter
    if (status && ['New', 'Contacted', 'Qualified', 'Lost'].includes(status)) {
      query.status = status;
    }

    // Search query for name or email
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('assignedTo', 'name email')
        .populate('company', 'name industry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Leads retrieved successfully.',
      data: {
        leads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lead details
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false })
      .populate('assignedTo', 'name email')
      .populate('company', 'name industry location');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead retrieved successfully.',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, status, assignedTo, company } = req.body;

    if (!name || !email || !phone || !assignedTo || !company) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, assignedTo, and company.',
      });
    }

    // Check if company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: 'Associated company does not exist.',
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

    const lead = await Lead.create({
      name,
      email,
      phone,
      status: status || 'New',
      assignedTo,
      company,
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('company', 'name industry');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully.',
      data: populatedLead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    const { name, email, phone, status, assignedTo, company } = req.body;

    if (company) {
      const companyExists = await Company.findById(company);
      if (!companyExists) {
        return res.status(404).json({
          success: false,
          message: 'Associated company does not exist.',
        });
      }
      lead.company = company;
    }

    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user does not exist.',
        });
      }
      lead.assignedTo = assignedTo;
    }

    if (name) lead.name = name;
    if (email) lead.email = email;
    if (phone) lead.phone = phone;
    if (status) lead.status = status;

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('company', 'name industry');

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully.',
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
// @access  Private
const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['New', 'Contacted', 'Qualified', 'Lost'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: New, Contacted, Qualified, Lost.',
      });
    }

    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    lead.status = status;
    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('company', 'name industry');

    res.status(200).json({
      success: true,
      message: 'Lead status updated successfully.',
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or already deleted.',
      });
    }

    lead.isDeleted = true;
    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully.',
      data: { _id: lead._id, isDeleted: true },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
};
