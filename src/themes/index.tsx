import { amber } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00887a',
      contrastText: '#fff',
    },
    secondary: {
      main: '#77a6f7',
      contrastText: '#000',
    },
  },
});

export default theme;
