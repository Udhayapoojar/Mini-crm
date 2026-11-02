import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to login. Please check credentials.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 4,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Mini CRM
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to access your business workspace
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email address"
            type="email"
            fullWidth
            required
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            sx={{ mb: 2 }}
            placeholder="admin@crm.local"
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            sx={{ mb: 3 }}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting}
            sx={{ py: 1.2, fontWeight: 600 }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;

