import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import ContactsIcon from '@mui/icons-material/ContactsOutlined';
import BusinessIcon from '@mui/icons-material/BusinessOutlined';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';

const DRAWER_WIDTH = 240;

const navItems = [
  { text: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { text: 'Leads', path: '/leads', icon: ContactsIcon },
  { text: 'Companies', path: '/companies', icon: BusinessIcon },
  { text: 'Tasks', path: '/tasks', icon: AssignmentIcon },
];

const SidebarContent = ({ onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            backgroundColor: '#1e3a8a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          C
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#0f172a' }}>
            Mini CRM
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Business Suite
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 1.5,
                  py: 1,
                  px: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#172554',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#ffffff',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#ffffff' : '#64748b',
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            borderRight: '1px solid #e2e8f0',
            boxSizing: 'border-box',
          },
        }}
      >
        <SidebarContent onCloseMobile={onMobileClose} />
      </Drawer>

      {/* Desktop Persistent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            borderRight: '1px solid #e2e8f0',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
