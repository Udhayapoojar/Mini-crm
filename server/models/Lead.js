const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide lead name'],
      trim: true,
      maxlength: [60, 'Lead name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide lead email'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Qualified', 'Lost'],
        message: '{VALUE} is not a valid lead status',
      },
      default: 'New',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign lead to a user'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Please associate lead with a company'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query optimization
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ company: 1 });
leadSchema.index({ isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
