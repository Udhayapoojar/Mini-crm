const Company = require('../models/Company');
const Lead = require('../models/Lead');

// @desc    Get all companies with optional search
// @route   GET /api/companies
// @access  Private
const getCompanies = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { industry: searchRegex }, { location: searchRegex }];
    }

    const companies = await Company.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: 'Companies retrieved successfully.',
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company by ID with active associated leads
// @route   GET /api/companies/:id
// @access  Private
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    // Fetch only active, non-deleted leads associated with this company
    const associatedLeads = await Lead.find({
      company: company._id,
      isDeleted: false,
    })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Company details retrieved successfully.',
      data: {
        ...company.toObject(),
        leads: associatedLeads,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private
const createCompany = async (req, res, next) => {
  try {
    const { name, industry, location, description } = req.body;

    if (!name || !industry || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name, industry, and location.',
      });
    }

    const company = await Company.create({
      name,
      industry,
      location,
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully.',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private
const updateCompany = async (req, res, next) => {
  try {
    const { name, industry, location, description } = req.body;

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    if (name) company.name = name;
    if (industry) company.industry = industry;
    if (location) company.location = location;
    if (description !== undefined) company.description = description;

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company updated successfully.',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
};
