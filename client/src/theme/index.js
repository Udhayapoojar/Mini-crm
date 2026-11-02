import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // Professional deep navy/slate blue
      light: '#3b82f6',
      dark: '#172554',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#475569', // Slate gray
      light: '#64748b',
      dark: '#334155',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Very subtle neutral off-white
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // High-contrast crisp dark slate
      secondary: '#64748b', // Muted slate for captions/subtext
    },
    divider: '#e2e8f0', // Crisp subtle border
    success: {
      main: '#16a34a',
      light: '#dcfce7',
      dark: '#15803d',
    },
    warning: {
      main: '#d97706',
      light: '#fef3c7',
      dark: '#b45309',
    },
    error: {
      main: '#dc2626',
      light: '#fee2e2',
      dark: '#b91c1c',
    },
    info: {
      main: '#2563eb',
      light: '#dbeafe',
      dark: '#1d4ed8',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#0f172a' },
    h2: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#0f172a' },
    h3: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em', color: '#0f172a' },
    h4: { fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' },
    h5: { fontSize: '1rem', fontWeight: 600, color: '#0f172a' },
    h6: { fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' },
    body1: { fontSize: '0.875rem', lineHeight: 1.5, color: '#0f172a' },
    body2: { fontSize: '0.8125rem', lineHeight: 1.45, color: '#64748b' },
    button: { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem' },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          padding: '6px 14px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#1e3a8a',
          '&:hover': {
            backgroundColor: '#172554',
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid #e2e8f0',
          borderRadius: 6,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f8fafc',
          color: '#475569',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 16px',
        },
        body: {
          fontSize: '0.875rem',
          borderBottom: '1px solid #f1f5f9',
          padding: '12px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '0.875rem',
          '& fieldset': {
            borderColor: '#cbd5e1',
          },
          '&:hover fieldset': {
            borderColor: '#94a3b8',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#1e3a8a',
            borderWidth: '1.5px',
          },
        },
        input: {
          padding: '10px 14px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
          height: 24,
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;
