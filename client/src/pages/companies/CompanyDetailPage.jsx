import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import StatusChip from '../../components/common/StatusChip';
import CompanyFormDialog from './CompanyFormDialog';
import { getCompanyById } from '../../services/companyService';

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCompanyById(id);
      if (res.success && res.data) {
        setCompany(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load company details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error || !company) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/companies')}
          sx={{ mb: 2 }}
        >
          Back to Companies
        </Button>
        <Alert severity="error">{error || 'Company not found.'}</Alert>
      </Box>
    );
  }

  const associatedLeads = company.leads || [];

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/companies')}
        size="small"
        sx={{ mb: 2.5, color: '#475569' }}
      >
        Back to Companies
      </Button>

      {/* Company Header Card */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                backgroundColor: '#1e3a8a15',
                color: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BusinessIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {company.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {company.industry} • {company.location}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setEditOpen(true)}
            sx={{ borderColor: '#cbd5e1', color: '#475569' }}
          >
            Edit Company
          </Button>
        </Box>

        {company.description && (
          <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              ABOUT COMPANY
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: '#334155' }}>
              {company.description}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Associated Active Leads Section */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
              Associated Active Leads
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Only active, non-deleted leads linked to {company.name} ({associatedLeads.length})
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, borderColor: '#f1f5f9' }} />

        {associatedLeads.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center', color: '#64748b' }}>
            <Typography variant="body2">No active leads associated with this company yet.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Lead Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned User</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {associatedLeads.map((lead) => (
                  <TableRow key={lead._id} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>
                      <StatusChip status={lead.status} />
                    </TableCell>
                    <TableCell>{lead.assignedTo?.name || 'Unassigned'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <CompanyFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        company={company}
        onSuccess={() => {
          fetchCompanyDetails();
        }}
      />
    </Box>
  );
};

export default CompanyDetailPage;

