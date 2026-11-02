import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StatusChip from '../../components/common/StatusChip';
import TaskFormDialog from './TaskFormDialog';
import { getTasks, updateTaskStatus } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';

const TASK_STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Completed'];

const TasksListPage = () => {
  const { user: currentUser } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals and feedback
  const [createOpen, setCreateOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await getTasks(params);
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to fetch tasks.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingId(taskId);
      await updateTaskStatus(taskId, newStatus);
      setNotification({
        open: true,
        message: 'Task status updated successfully.',
        severity: 'success',
      });
      fetchTasks();
    } catch (err) {
      // Backend enforces ownership: 403 Forbidden if not assigned user
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? 'Forbidden: Only the assigned user can update this task status.'
          : 'Failed to update task status.');

      setNotification({
        open: true,
        message: errorMsg,
        severity: 'error',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Tasks & Follow-ups
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your schedule and lead activities ({tasks.length} tasks)
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Create Task
        </Button>
      </Box>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          select
          label="Filter by Status"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {TASK_STATUS_OPTIONS.map((st) => (
            <MenuItem key={st} value={st}>
              {st}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* Tasks Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Title & Notes</TableCell>
                <TableCell>Associated Lead</TableCell>
                <TableCell>Assigned User</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status (Assignee Only)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748b' }}>
                    No tasks found matching your filter.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => {
                  const isAssignedToCurrentUser =
                    currentUser &&
                    (task.assignedTo?._id === currentUser._id ||
                      task.assignedTo === currentUser._id);

                  return (
                    <TableRow key={task._id} hover>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            {task.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {task.lead?.name || 'Unlinked Lead'}
                        </Typography>
                        {task.lead?.company?.name && (
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            {task.lead.company.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {task.assignedTo?.name || 'Unassigned'}
                          </Typography>
                          {isAssignedToCurrentUser && (
                            <Chip
                              label="You"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                backgroundColor: '#dbeafe',
                                color: '#1e3a8a',
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            select
                            size="small"
                            value={task.status}
                            disabled={updatingId === task._id}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                            sx={{
                              '& .MuiSelect-select': {
                                p: 0,
                                pr: '20px !important',
                              },
                            }}
                          >
                            {['Pending', 'In Progress', 'Completed'].map((st) => (
                              <MenuItem key={st} value={st}>
                                <StatusChip status={st} />
                              </MenuItem>
                            ))}
                          </TextField>
                          {updatingId === task._id && <CircularProgress size={16} />}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Task Modal */}
      <TaskFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={(msg) => {
          setNotification({ open: true, message: msg, severity: 'success' });
          fetchTasks();
        }}
      />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={notification.severity}
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%', borderRadius: 1.5 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TasksListPage;
