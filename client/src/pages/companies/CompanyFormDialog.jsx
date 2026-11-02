import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { createCompany, updateCompany } from '../../services/companyService';

const CompanyFormDialog = ({ open, onClose, company, onSuccess }) => {
  const isEdit = Boolean(company);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        location: company.location || '',
        description: company.description || '',
      });
    } else {
      setFormData({
        name: '',
        industry: '',
        location: '',
        description: '',
      });
    }
    setError('');
  }, [company, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.industry.trim() || !formData.location.trim()) {
      setError('Please fill in company name, industry, and location.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (isEdit) {
        await updateCompany(company._id, formData);
      } else {
        await createCompany(formData);
      }

      onSuccess(isEdit ? 'Company updated successfully.' : 'Company created successfully.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save company.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.125rem', pb: 1 }}>
        {isEdit ? 'Edit Company' : 'Add New Company'}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" id="company-form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Company Name"
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
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                disabled={submitting}
                placeholder="e.g. Technology, Retail, Finance"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                disabled={submitting}
                placeholder="e.g. San Francisco, CA"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                size="small"
                disabled={submitting}
                placeholder="Optional notes or summary..."
              />
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
          form="company-form"
          variant="contained"
          disabled={submitting}
          size="small"
        >
          {submitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Create Company'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyFormDialog;
