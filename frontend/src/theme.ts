import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8B0000', // Maroon
      light: '#B22222',
      dark: '#650000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F5F5DC', // Cream
      light: '#FEFEFE',
      dark: '#E6E6C7',
      contrastText: '#8B0000',
    },
    background: {
      default: '#FEFEFE',
      paper: '#F5F5DC',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#5C5C5C',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#8B0000',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#8B0000',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#8B0000',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#8B0000',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(139, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(139, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#8B0000',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
        },
      },
    },
  },
});

export default theme;