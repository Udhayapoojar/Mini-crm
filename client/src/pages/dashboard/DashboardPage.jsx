import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Alert,
  Skeleton,
  Paper,
  Button,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import StatCard from '../../components/common/StatCard';
import { getDashboardStats } from '../../services/dashboardService';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Box>
      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Operations Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time pipeline metrics and task status from MongoDB aggregations
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={fetchStats}
          disabled={loading}
          sx={{ borderColor: '#cbd5e1', color: '#475569' }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      {/* Primary Statistics Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {loading ? (
          [1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rounded" height={105} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Leads"
                value={stats?.totalLeads ?? 0}
                icon={PeopleAltOutlinedIcon}
                color="#1e3a8a"
                subtitle="Active in pipeline"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Qualified Leads"
                value={stats?.qualifiedLeads ?? 0}
                icon={CheckCircleOutlineOutlinedIcon}
                color="#16a34a"
                subtitle="Sales-ready leads"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tasks Due Today"
                value={stats?.tasksDueToday ?? 0}
                icon={CalendarTodayOutlinedIcon}
                color="#d97706"
                subtitle="Scheduled for today"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Completed Tasks"
                value={stats?.completedTasks ?? 0}
                icon={TaskAltOutlinedIcon}
                color="#0284c7"
                subtitle="All-time completed"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Additional Pipeline Summary Cards */}
      {!loading && stats?.breakdown && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Lead Status Distribution
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, backgroundColor: '#eff6ff', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 600 }}>New</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                      {stats.breakdown.leads.new}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, backgroundColor: '#fffbeb', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600 }}>Contacted</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#b45309' }}>
                      {stats.breakdown.leads.contacted}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, backgroundColor: '#f0fdf4', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>Qualified</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#15803d' }}>
                      {stats.breakdown.leads.qualified}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, backgroundColor: '#fef2f2', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>Lost</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#b91c1c' }}>
                      {stats.breakdown.leads.lost}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Task Workload Breakdown
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, backgroundColor: '#fffbeb', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600 }}>Pending</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#b45309' }}>
                      {stats.breakdown.tasks.pending}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, backgroundColor: '#eff6ff', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 600 }}>In Progress</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                      {stats.breakdown.tasks.inProgress}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, backgroundColor: '#f0fdf4', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>Completed</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#15803d' }}>
                      {stats.breakdown.tasks.completed}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DashboardPage;
