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
import { getLeads } from '../../services/leadService';
import { createTask } from '../../services/taskService';

const TASK_STATUSES = ['Pending', 'In Progress', 'Completed'];

const TaskFormDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lead: '',
    assignedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
  });

  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      const loadOptions = async () => {
        try {
          setLoadingOptions(true);
          const [usersRes, leadsRes] = await Promise.all([
            getUsers(),
            getLeads({ limit: 100 }), // Fetch active leads for dropdown
          ]);
          setUsers(usersRes.data || []);
          setLeads(leadsRes.data?.leads || []);
        } catch (err) {
          setError('Failed to load users or leads options.');
        } finally {
          setLoadingOptions(false);
        }
      };
      loadOptions();
      setFormData({
        title: '',
        description: '',
        lead: '',
        assignedTo: '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
      });
      setError('');
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.lead || !formData.assignedTo || !formData.dueDate) {
      setError('Please provide title, lead, assigned user, and due date.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await createTask(formData);
      onSuccess('Task created successfully.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.125rem', pb: 1 }}>
        Create Follow-up Task
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" id="task-form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Task Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                disabled={submitting}
                placeholder="e.g. Follow-up demo call with CTO"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Associated Lead"
                name="lead"
                value={formData.lead}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                disabled={submitting || loadingOptions}
                helperText={loadingOptions ? 'Loading leads...' : ''}
              >
                {leads.map((l) => (
                  <MenuItem key={l._id} value={l._id}>
                    {l.name} ({l.company?.name || 'No Company'})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
              <TextField
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Initial Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
                size="small"
                disabled={submitting}
              >
                {TASK_STATUSES.map((st) => (
                  <MenuItem key={st} value={st}>
                    {st}
                  </MenuItem>
                ))}
              </TextField>
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
                placeholder="Optional notes or agenda for this task..."
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
          form="task-form"
          variant="contained"
          disabled={submitting || loadingOptions}
          size="small"
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskFormDialog;

