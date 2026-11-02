import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CompanyFormDialog from './CompanyFormDialog';
import { getCompanies } from '../../services/companyService';

const CompaniesListPage = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      const res = await getCompanies(params);
      if (res.success && res.data) {
        setCompanies(res.data);
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to fetch companies.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleOpenCreate = () => {
    setSelectedCompany(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (company) => {
    setSelectedCompany(company);
    setFormOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Companies
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage client accounts, industries, and business entities ({companies.length})
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Company
        </Button>
      </Box>

      {/* Search Input */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search by company name, industry, or location..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 320, width: { xs: '100%', sm: 400 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Companies Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Company Name</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748b' }}>
                    No companies found.
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((comp) => (
                  <TableRow key={comp._id} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>
                      {comp.name}
                    </TableCell>
                    <TableCell>{comp.industry}</TableCell>
                    <TableCell>{comp.location}</TableCell>
                    <TableCell sx={{ maxWidth: 260, color: '#64748b' }}>
                      <Typography variant="body2" noWrap>
                        {comp.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Company & Associated Leads">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/companies/${comp._id}`)}
                          sx={{ mr: 0.5 }}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Company">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(comp)}
                          sx={{ color: '#475569' }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create / Edit Company Form Dialog */}
      <CompanyFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        company={selectedCompany}
        onSuccess={(msg) => {
          setNotification({ open: true, message: msg, severity: 'success' });
          fetchCompanies();
        }}
      />

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

export default CompaniesListPage;

