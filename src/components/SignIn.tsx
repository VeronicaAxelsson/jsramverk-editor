import React, { useState } from 'react';

import { Container, Typography, Box, TextField, Button, Grid, Link } from '@mui/material';

import useAuth, { UserCredentials } from '../utils/auth';

import { Controller, useForm } from 'react-hook-form';

type FormMode = 'Sign In' | 'Sign Up';

type FormValues = {
    email: string;
    password: string;
};

const SignIn: React.FC = () => {
    const [formMode, setFormMode] = useState<FormMode>('Sign In');
    const { handleSubmit, control } = useForm<FormValues>({
        defaultValues: {
            email: '',
            password: ''
        }
    });
    const { login, register } = useAuth();

    const handleSubmitCredentials = async (data: UserCredentials) => {
        if (formMode === 'Sign In') {
            login(data);
        }

        if (formMode === 'Sign Up') {
            await register(data);
            await login(data);
        }
    };

    const changeFormMode = () => {
        formMode === 'Sign In' ? setFormMode('Sign Up') : setFormMode('Sign In');
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Typography component="h1" variant="h5">
                    {formMode}
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit(handleSubmitCredentials)}
                    noValidate
                    sx={{ mt: 1 }}
                >
                    <Controller
                        control={control}
                        name={'email'}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                autoComplete="email"
                                autoFocus
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name={'password'}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />
                        )}
                    />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        {formMode}
                    </Button>
                    <Grid container>
                        <Grid item xs></Grid>
                        <Grid item>
                            <Link
                                onClick={changeFormMode}
                                variant="body2"
                                sx={{ cursor: 'pointer' }}
                            >
                                {formMode == 'Sign In'
                                    ? "Don't have an account? Sign Up"
                                    : 'Already have an account? Sign In'}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};

export default SignIn;
