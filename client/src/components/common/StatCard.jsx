import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const StatCard = ({ title, value, icon: Icon, color = '#1e3a8a', subtitle }) => {
  return (
    <Paper
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
      }}
    >
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {Icon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 1.5,
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          <Icon fontSize="medium" />
        </Box>
      )}
    </Paper>
  );
};

export default StatCard;

