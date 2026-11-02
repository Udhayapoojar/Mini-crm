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
  Pagination,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LeadFormDialog from './LeadFormDialog';
import { getLeads, deleteLead, updateLeadStatus } from '../../services/leadService';

const STATUS_OPTIONS = ['All', 'New', 'Contacted', 'Qualified', 'Lost'];

const LeadsListPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Feedback notifications
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 8,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await getLeads(params);
      if (res.success && res.data) {
        setLeads(res.data.leads || []);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalLeads(res.data.pagination.total || 0);
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to fetch leads.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Debounced or direct search handlers
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setSelectedLead(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setSelectedLead(lead);
    setFormOpen(true);
  };

  const handlePromptDelete = (lead) => {
    setLeadToDelete(lead);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      setDeleteLoading(true);
      await deleteLead(leadToDelete._id);
      setDeleteConfirmOpen(false);
      setLeadToDelete(null);
      setNotification({
        open: true,
        message: 'Lead deleted successfully (soft-deleted).',
        severity: 'success',
      });
      fetchLeads();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to delete lead.',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleQuickStatusChange = async (leadId, newStatus) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      setNotification({
        open: true,
        message: 'Lead status updated.',
        severity: 'success',
      });
      fetchLeads();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to update status.',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Leads
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your sales pipeline ({totalLeads} active leads)
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Lead
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search by name or email..."
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ minWidth: 260, flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Filter by Status"
          size="small"
          value={statusFilter}
          onChange={handleStatusChange}
          sx={{ minWidth: 160 }}
        >
          {STATUS_OPTIONS.map((st) => (
            <MenuItem key={st} value={st}>
              {st}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* Leads Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email & Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Company</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748b' }}>
                    No leads found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead._id} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>
                      {lead.name}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#0f172a' }}>
                        {lead.email}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {lead.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={lead.status}
                        onChange={(e) => handleQuickStatusChange(lead._id, e.target.value)}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          '& .MuiSelect-select': {
                            p: 0,
                            pr: '20px !important',
                          },
                        }}
                      >
                        {['New', 'Contacted', 'Qualified', 'Lost'].map((st) => (
                          <MenuItem key={st} value={st}>
                            <StatusChip status={st} />
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {lead.assignedTo?.name || 'Unassigned'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {lead.company?.name || 'N/A'}
                      </Typography>
                      {lead.company?.industry && (
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                          {lead.company.industry}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Lead">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(lead)}
                          sx={{ color: '#475569', mr: 0.5 }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Lead (Soft Delete)">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handlePromptDelete(lead)}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="small"
            shape="rounded"
          />
        </Box>
      </Paper>

      {/* Add / Edit Form Modal */}
      <LeadFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        lead={selectedLead}
        onSuccess={(msg) => {
          setNotification({ open: true, message: msg, severity: 'success' });
          fetchLeads();
        }}
      />

      {/* Confirmation Dialog for Soft Delete */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${leadToDelete?.name}"? The lead will be soft-deleted and removed from active pipeline views.`}
        confirmText="Delete Lead"
        confirmColor="error"
        loading={deleteLoading}
      />

      {/* Notification Snackbar */}
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

export default LeadsListPage;
