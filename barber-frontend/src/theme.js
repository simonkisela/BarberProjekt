// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0d47a1', // tmavomodrá
    },
    secondary: {
      main: '#f50057', // výrazná ružová
    },
    success: {
      main: '#4caf50', // zelená
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
});

export default theme;
