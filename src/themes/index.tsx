import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#00887a',
            contrastText: '#fff',
        },
        secondary: {
            main: '#4D6D9A',
            contrastText: '#000',
        },
        background: {
            default: '#86B3D1',
        },
    },
});

export default theme;
