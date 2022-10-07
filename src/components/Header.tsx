import * as React from 'react';
import {
    AppBar,
    Box,
    Container,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Avatar,
    Tooltip,
    MenuItem
} from '@mui/material';
import AbcIcon from '@mui/icons-material/Abc';
import AccountCircle from '@mui/icons-material/AccountCircle';
import useAuth from '../utils/auth';

const settings = ['Logout'];

const Header = () => {
    const { user, logout } = useAuth();
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = (setting: string) => {
        if (setting === 'Logout') {
            logout();
        }
        setAnchorElUser(null);
    };

    const refreshPage = () => {
        window.location.reload();
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h5"
                        noWrap
                        sx={{
                            mr: 2,
                            display: { xs: 'flex' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none'
                        }}
                    >                   
                     <AbcIcon
                    fontSize="large"
                    sx={{
                        display: { xs: 'flex' },
                        mr: 1,
                        color: '#fff'
                    }}
                />
                        EDITOR
                    </Typography>
                    {user && (
                        <React.Fragment>
                        <Typography variant="h6" component="div" sx={{ ml: 3 }}>
                        {user?.email}
                        <Tooltip title="Open menu">
                                <IconButton onClick={handleOpenUserMenu} sx={{ ml: 3}}>
                                    <AccountCircle fontSize="large" sx={{ color: '#fff' }} />
                                </IconButton>
                            </Tooltip>
                        </Typography>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right'
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right'
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map((setting) => (
                                    <MenuItem
                                        key={setting}
                                        onClick={() => handleCloseUserMenu(setting)}
                                    >
                                        <Typography textAlign="center">{setting}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </React.Fragment>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;
