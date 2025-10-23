// clinic/src/frontend/Auth.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, TextField, Button, Alert, Grid, CircularProgress, InputAdornment } from '@mui/material';
import { Login as LoginIcon, AccountCircle, Lock } from '@mui/icons-material';

const API_BASE_URL = 'http://localhost/project/clinic/backend/api_all.php?route=';

const Auth = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({ 
        username: 'staff', // Default for testing
        password: 'password123' 
    });
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        try {
            // Gumagamit ng 'staff/login' endpoint na nag-che-check ng staff at doctor
            const response = await axios.post(API_BASE_URL + 'staff/login', formData);
            
            const { token, user_id, role, message } = response.data;

            if (token && user_id && role) {
                setMessage({ severity: 'success', text: `Login successful! Welcome, ${role}.` });
                setTimeout(() => {
                    onLoginSuccess({ token, user_id, role });
                }, 1000);
            } else {
                 setMessage({ severity: 'warning', text: message || 'Login failed. Invalid response from server.' });
            }

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Invalid username or password. Please try again.';
            setMessage({ severity: 'error', text: errorMsg });

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Grid container component="main" sx={{ height: '100vh', backgroundColor: '#f5f5f5' }} justifyContent="center" alignItems="center">
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography component="h1" variant="h4" sx={{ mb: 1, color: '#1976d2' }}>Clinic Management System</Typography>
                    <Typography component="h2" variant="h5" sx={{ mb: 3 }}>User Login</Typography>
                    {message && <Alert severity={message.severity} sx={{ width: '100%', mb: 2 }}>{message.text}</Alert>}
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal" required fullWidth label="Username" name="username" autoFocus
                            value={formData.username} onChange={handleChange} disabled={isLoading}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><AccountCircle /></InputAdornment>) }}
                        />
                        <TextField
                            margin="normal" required fullWidth name="password" label="Password" type="password"
                            value={formData.password} onChange={handleChange} disabled={isLoading}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>) }}
                        />
                        <Button
                            type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}
                            startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <LoginIcon />}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </Button>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

export default Auth;