import React from 'react';
import { Chip } from '@mui/material';

const statusConfig = {
  // Lead statuses
  New: { label: 'New', color: '#2563eb', bg: '#eff6ff' },
  Contacted: { label: 'Contacted', color: '#d97706', bg: '#fffbeb' },
  Qualified: { label: 'Qualified', color: '#16a34a', bg: '#f0fdf4' },
  Lost: { label: 'Lost', color: '#dc2626', bg: '#fef2f2' },
  // Task statuses
  Pending: { label: 'Pending', color: '#d97706', bg: '#fffbeb' },
  'In Progress': { label: 'In Progress', color: '#2563eb', bg: '#eff6ff' },
  Completed: { label: 'Completed', color: '#16a34a', bg: '#f0fdf4' },
};

const StatusChip = ({ status, size = 'small' }) => {
  const config = statusConfig[status] || { label: status, color: '#475569', bg: '#f1f5f9' };

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: '0.75rem',
        border: `1px solid ${config.color}30`,
        height: 24,
      }}
    />
  );
};

export default StatusChip;
