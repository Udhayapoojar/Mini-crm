const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');

// All lead routes are protected
router.use(protect);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.patch('/:id/status', updateLeadStatus);

module.exports = router;
