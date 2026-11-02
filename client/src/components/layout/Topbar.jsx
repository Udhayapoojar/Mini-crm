import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import { useAuth } from '../../context/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads Management',
  '/companies': 'Companies Directory',
  '/tasks': 'Tasks & Follow-ups',
};

const Topbar = ({ onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Find matching title based on current path
  let currentTitle = 'Overview';
  for (const [path, title] of Object.entries(pageTitles)) {
    if (location.pathname === path || location.pathname.startsWith(`${path}/`)) {
      currentTitle = title;
      break;
    }
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        backgroundColor: '#ffffff',
        color: '#0f172a',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: 'none',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ display: { md: 'none' }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#0f172a' }}>
            {currentTitle}
          </Typography>
        </Box>

        {/* User Info & Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountCircleIcon sx={{ color: '#64748b', fontSize: 22 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {user.name}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                sx={{
                  backgroundColor: user.role === 'Admin' ? '#dbeafe' : '#f1f5f9',
                  color: user.role === 'Admin' ? '#1e3a8a' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            </Box>
          )}

          <Button
            variant="outlined"
            size="small"
            color="secondary"
            startIcon={<LogoutIcon fontSize="small" />}
            onClick={logout}
            sx={{
              borderColor: '#cbd5e1',
              color: '#475569',
              '&:hover': {
                borderColor: '#94a3b8',
                backgroundColor: '#f8fafc',
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;

