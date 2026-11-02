import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { getUsers } from '../../services/userService';
import { getCompanies } from '../../services/companyService';
import { createLead, updateLead } from '../../services/leadService';

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

const LeadFormDialog = ({ open, onClose, lead, onSuccess }) => {
  const isEdit = Boolean(lead);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'New',
    assignedTo: '',
    company: '',
  });

  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch dropdown options for Users and Companies
  useEffect(() => {
    if (open) {
      const loadOptions = async () => {
        try {
          setLoadingOptions(true);
          const [usersRes, companiesRes] = await Promise.all([
            getUsers(),
            getCompanies(),
          ]);
          setUsers(usersRes.data || []);
          setCompanies(companiesRes.data || []);
        } catch (err) {
          setError('Failed to load users or companies.');
        } finally {
          setLoadingOptions(false);
        }
      };
      loadOptions();
    }
  }, [open]);

  // Set initial form state for create or edit mode
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'New',
        assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
        company: lead.company?._id || lead.company || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'New',
        assignedTo: '',
        company: '',
      });
    }
    setError('');
  }, [lead, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Lead name is required.';
    if (!formData.email.trim()) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) return 'Please provide a valid email.';
    if (!formData.phone.trim()) return 'Phone number is required.';
    if (!formData.assignedTo) return 'Please select an assigned user.';
    if (!formData.company) return 'Please select an associated company.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (isEdit) {
        await updateLead(lead._id, formData);
      } else {
        await createLead(formData);
      }

      onSuccess(isEdit ? 'Lead updated successfully.' : 'Lead created successfully.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lead. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.125rem', pb: 1 }}>
        {isEdit ? 'Edit Lead' : 'Create New Lead'}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" id="lead-form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
                size="small"
                disabled={submitting}
              >
                {LEAD_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                select
                label="Assigned User"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                disabled={submitting || loadingOptions}
                helperText={loadingOptions ? 'Loading users...' : ''}
              >
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                disabled={submitting || loadingOptions}
                helperText={loadingOptions ? 'Loading companies...' : ''}
              >
                {companies.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name} — {c.industry}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit" size="small">
          Cancel
        </Button>
        <Button
          type="submit"
          form="lead-form"
          variant="contained"
          disabled={submitting || loadingOptions}
          size="small"
        >
          {submitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Create Lead'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeadFormDialog;

