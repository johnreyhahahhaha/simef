// clinic/src/frontend/StaffDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import {
    Box, AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, Paper, Grid, TextField, Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl,
} from "@mui/material";
import {
    Menu as MenuIcon, Dashboard as DashboardIcon, PersonAdd as RegisterIcon, Event as EventIcon, People as PeopleIcon, Edit as EditIcon, Cancel as CancelIcon, CalendarMonth as CalendarIcon, Logout as LogoutIcon,
} from "@mui/icons-material";
import { format } from 'date-fns';

// *** BASE API URL ***
const API_BASE_URL = 'http://localhost/project/clinic/backend/api_all.php?route=';

// =========================================================
// --- COMPONENT 1: Register Patient Form ---
// =========================================================
const RegisterPatientForm = ({ onRegistrationSuccess }) => {
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', birth_date: '', gender: 'Male', contact_number: '', address: '', hmo_id: '',
    });
    const [message, setMessage] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ severity: 'info', text: 'Registering patient...' });

        try {
            const response = await axios.post(API_BASE_URL + 'patients/register', formData);
            setMessage({ severity: 'success', text: response.data.message });
            setFormData({ first_name: '', last_name: '', birth_date: '', gender: 'Male', contact_number: '', address: '', hmo_id: '' });
            setTimeout(onRegistrationSuccess, 1500);
        } catch (error) {
            setMessage({ severity: 'error', text: 'Registration Failed: ' + (error.response?.data?.message || error.message) });
        }
    };

    return (
        <Paper sx={{ p: 4, mt: 3 }}>
            <Typography variant="h5" gutterBottom>Patient Registration</Typography>
            {message && <Alert severity={message.severity} sx={{ mb: 2 }}>{message.text}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required /></Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Date of Birth" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Gender</InputLabel>
                            <Select name="gender" value={formData.gender} label="Gender" onChange={handleChange}>
                                <MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Contact Number" name="contact_number" value={formData.contact_number} onChange={handleChange} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="HMO ID (Optional)" name="hmo_id" value={formData.hmo_id} onChange={handleChange} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} multiline rows={1} /></Grid>
                    <Grid item xs={12}><Button type="submit" variant="contained" color="primary" startIcon={<RegisterIcon />}>Register Patient</Button></Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

// =========================================================
// --- COMPONENT 2: Edit Patient Dialog ---
// =========================================================
const EditPatientDialog = ({ patient, onClose, onUpdate }) => {
    // Initial state setup, converting nulls/undefined to empty string for forms
    const [formData, setFormData] = useState({
        ...patient,
        contact_number: patient.contact_number || '',
        address: patient.address || '',
        hmo_id: patient.hmo_id || '',
    });
    const [message, setMessage] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ severity: 'info', text: 'Updating patient record...' });

        try {
            // Using the new 'patients/update' PHP route
            const response = await axios.put(API_BASE_URL + `patients/update&id=${patient.patient_id}`, formData);
            
            setMessage({ severity: 'success', text: response.data.message });
            setTimeout(() => {
                onUpdate(); // Refresh list on StaffDashboard
                onClose(); 
            }, 1500);

        } catch (error) {
            setMessage({ severity: 'error', text: 'Update Failed: ' + (error.response?.data?.message || error.message) });
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Patient: {patient.first_name} {patient.last_name}</DialogTitle>
            <DialogContent>
                {message && <Alert severity={message.severity} sx={{ mb: 2, mt: 2 }}>{message.text}</Alert>}
                <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required /></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Date of Birth" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Gender</InputLabel>
                                <Select name="gender" value={formData.gender} label="Gender" onChange={handleChange}>
                                    <MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Contact Number" name="contact_number" value={formData.contact_number} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="HMO ID (Optional)" name="hmo_id" value={formData.hmo_id} onChange={handleChange} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} multiline rows={1} /></Grid>
                    </Grid>
                    <DialogActions sx={{ mt: 3, p: 0 }}>
                        <Button onClick={onClose} color="error">Cancel</Button>
                        <Button type="submit" variant="contained" color="success" startIcon={<EditIcon />}>Save Changes</Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};


// =========================================================
// --- COMPONENT 3: Patient List Table ---
// =========================================================
const PatientListTable = ({ patients, onSchedule, onEdit }) => {
    return (
        <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: '#e0f7fa' }}>
                        <TableCell>ID</TableCell><TableCell>Full Name</TableCell><TableCell>Date of Birth</TableCell><TableCell>Contact</TableCell><TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {patients.length === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center">No patients registered.</TableCell></TableRow>
                    ) : (
                        patients.map((patient) => (
                            <TableRow key={patient.patient_id} hover>
                                <TableCell>{patient.patient_id}</TableCell>
                                <TableCell>{patient.first_name} {patient.last_name}</TableCell>
                                <TableCell>{patient.birth_date}</TableCell>
                                <TableCell>{patient.contact_number}</TableCell>
                                <TableCell sx={{ minWidth: 180 }}>
                                    <Button size="small" variant="outlined" startIcon={<CalendarIcon />} onClick={() => onSchedule(patient)} sx={{ mr: 1 }}>Schedule</Button>
                                    <Button size="small" variant="contained" color="secondary" startIcon={<EditIcon />} onClick={() => onEdit(patient)}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};


// =========================================================
// --- COMPONENT 4: Appointment Scheduling Dialog ---
// =========================================================
const ScheduleAppointmentDialog = ({ patient, doctors, onClose, onScheduleSuccess }) => {
    const [formData, setFormData] = useState({
        patient_id: patient.patient_id,
        doctor_id: '',
        appointment_date: format(new Date(), 'yyyy-MM-dd'),
        appointment_time: '09:00',
        reason_for_visit: '',
    });
    const [message, setMessage] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ severity: 'info', text: 'Scheduling appointment...' });

        if (!formData.doctor_id) {
            setMessage({ severity: 'error', text: 'Please select a Doctor.' });
            return;
        }

        try {
            await axios.post(API_BASE_URL + 'appointments/schedule', formData);
            setMessage({ severity: 'success', text: 'Appointment scheduled successfully!' });
            
            setTimeout(() => {
                onScheduleSuccess();
                onClose();
            }, 1500);

        } catch (error) {
            setMessage({ severity: 'error', text: 'Scheduling Failed: ' + (error.response?.data?.message || error.message) });
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Schedule Appointment for: {patient.first_name} {patient.last_name}</DialogTitle>
            <DialogContent>
                {message && <Alert severity={message.severity} sx={{ mb: 2, mt: 2 }}>{message.text}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}><TextField fullWidth disabled label="Patient ID" value={formData.patient_id} /></Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Doctor</InputLabel>
                                <Select name="doctor_id" value={formData.doctor_id} label="Doctor" onChange={handleChange}>
                                    <MenuItem value="">Select Doctor</MenuItem>
                                    {doctors.map(d => (<MenuItem key={d.id} value={d.id}>{d.full_name} ({d.position})</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Date" name="appointment_date" type="date" value={formData.appointment_date} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Time" name="appointment_time" type="time" value={formData.appointment_time} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
                        </Grid>
                        <Grid item xs={12}><TextField fullWidth label="Reason for Visit" name="reason_for_visit" value={formData.reason_for_visit} onChange={handleChange} multiline rows={2} required /></Grid>
                    </Grid>
                    <DialogActions sx={{ mt: 3, p: 0 }}>
                        <Button onClick={onClose} color="error">Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">Confirm Schedule</Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};


// =========================================================
// --- COMPONENT 5: Appointment List Table ---
// =========================================================
const AppointmentListTable = ({ appointments, onAction }) => {
    const handleStatusChange = async (id, status) => {
        if (!window.confirm(`Are you sure you want to set Appointment ID ${id} status to: ${status}?`)) return;

        try {
            // Correct URL for PUT request
            await axios.put(API_BASE_URL + `appointments/status&id=${id}`, { status }); 
            onAction(); // Refresh list
        } catch (error) {
            alert('Failed to update status: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: '#e0f7fa' }}>
                        <TableCell>ID</TableCell><TableCell>Date/Time</TableCell><TableCell>Patient</TableCell><TableCell>Doctor</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {appointments.length === 0 ? (
                        <TableRow><TableCell colSpan={6} align="center">No appointments found.</TableCell></TableRow>
                    ) : (
                        appointments.map((app) => (
                            <TableRow key={app.appointment_id} hover>
                                <TableCell>{app.appointment_id}</TableCell>
                                <TableCell>{app.appointment_date} @ {app.appointment_time}</TableCell>
                                <TableCell>{app.first_name} {app.last_name}</TableCell>
                                <TableCell>{app.doctor_name}</TableCell>
                                <TableCell><span style={{ fontWeight: 'bold', color: app.status === 'Scheduled' ? 'green' : 'red' }}>{app.status}</span></TableCell>
                                <TableCell>
                                    {app.status === 'Scheduled' ? (
                                        <>
                                            <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => handleStatusChange(app.appointment_id, 'Cancelled')} sx={{ mr: 1 }}>Cancel</Button>
                                            <Button size="small" variant="outlined" color="warning" onClick={() => handleStatusChange(app.appointment_id, 'No-Show')}>No-Show</Button>
                                        </>
                                    ) : (
                                        <Typography variant="caption" color="textSecondary">No actions available</Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};


// =========================================================
// --- MAIN COMPONENT: StaffDashboard ---
// =========================================================
function StaffDashboard({ onLogout }) {
    const [open, setOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState("dashboard");
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [patientToSchedule, setPatientToSchedule] = useState(null);
    const [patientToEdit, setPatientToEdit] = useState(null); 

    const toggleDrawer = () => setOpen(!open);

    // --- Data Fetching Logic ---
    const fetchPatients = useCallback(async () => {
        try {
            const response = await axios.get(API_BASE_URL + 'patients');
            setPatients(response.data);
        } catch (error) { console.error("Error fetching patients:", error); setPatients([]); }
    }, []);

    const fetchAppointments = useCallback(async () => {
        try {
            const response = await axios.get(API_BASE_URL + 'appointments');
            setAppointments(response.data);
        } catch (error) { console.error("Error fetching appointments:", error); setAppointments([]); }
    }, []);

    const fetchDoctors = useCallback(async () => {
        try {
            const response = await axios.get(API_BASE_URL + 'staff/doctors');
            setDoctors(response.data);
        } catch (error) { console.error("Error fetching doctors:", error); setDoctors([]); }
    }, []);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchPatients(), fetchAppointments(), fetchDoctors()])
            .finally(() => setLoading(false));
    }, [fetchPatients, fetchAppointments, fetchDoctors]);

    // --- Handlers ---
    const handlePatientAction = () => {
        // Refresh both lists after any patient/appointment action
        fetchPatients();
        fetchAppointments();
    };
    
    const handleSchedulePatient = (patient) => {
        setPatientToSchedule(patient);
    };

    const handleEditPatient = (patient) => { 
        setPatientToEdit(patient);
    };
    
    // --- Content Renderer ---
    const renderContent = () => {
        if (loading) return <Typography variant="h5" sx={{ mt: 3 }}>Loading data... Please wait. ⏳</Typography>;

        switch (selectedMenu) {
            case "dashboard":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Staff Dashboard Overview 👋</Typography>
                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={4}><Paper sx={{ p: 3 }}>**Total Patients:** {patients.length}</Paper></Grid>
                            <Grid item xs={12} md={4}><Paper sx={{ p: 3 }}>**Scheduled Appointments:** {appointments.filter(a => a.status === 'Scheduled').length}</Paper></Grid>
                            <Grid item xs={12} md={4}><Paper sx={{ p: 3 }}>**Available Doctors:** {doctors.length}</Paper></Grid>
                        </Grid>
                        <Paper sx={{ p: 3, mt: 3 }}>Control center for patient registration and appointment management.</Paper>
                    </Box>
                );
            case "register":
                return <RegisterPatientForm onRegistrationSuccess={handlePatientAction} />;
                
            case "patients":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Patient List</Typography>
                        <PatientListTable 
                            patients={patients} 
                            onSchedule={handleSchedulePatient}
                            onEdit={handleEditPatient} 
                        />
                    </Box>
                );
            case "appointments":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Appointment Management</Typography>
                        <AppointmentListTable 
                            appointments={appointments} 
                            onAction={handlePatientAction} 
                        />
                    </Box>
                );
            default:
                return null;
        }
    };


    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            {/* Top AppBar */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: "linear-gradient(45deg, #4caf50, #81c784)", }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}><MenuIcon /></IconButton>
                    <Typography variant="h6" noWrap>Staff Dashboard</Typography>
                </Toolbar>
            </AppBar>
            {/* Sidebar Drawer */}
            <Drawer variant="temporary" open={open} onClose={toggleDrawer} sx={{"& .MuiDrawer-paper": { width: 240, boxSizing: "border-box", backgroundColor: "#e8f5e9", }, }}>
                <Toolbar />
                <List>
                    <ListItem button onClick={() => setSelectedMenu("dashboard")} selected={selectedMenu === "dashboard"}><ListItemIcon><DashboardIcon color={selectedMenu === "dashboard" ? "primary" : "inherit"} /></ListItemIcon><ListItemText primary="Dashboard Overview" /></ListItem>
                    <ListItem button onClick={() => setSelectedMenu("register")} selected={selectedMenu === "register"}><ListItemIcon><RegisterIcon color={selectedMenu === "register" ? "primary" : "inherit"} /></ListItemIcon><ListItemText primary="Register Patient" /></ListItem>
                    <ListItem button onClick={() => setSelectedMenu("patients")} selected={selectedMenu === "patients"}><ListItemIcon><PeopleIcon color={selectedMenu === "patients" ? "primary" : "inherit"} /></ListItemIcon><ListItemText primary="Patient List" /></ListItem>
                    <ListItem button onClick={() => setSelectedMenu("appointments")} selected={selectedMenu === "appointments"}><ListItemIcon><EventIcon color={selectedMenu === "appointments" ? "primary" : "inherit"} /></ListItemIcon><ListItemText primary="Appointments" /></ListItem>
                    <ListItem button onClick={onLogout}><ListItemIcon><LogoutIcon /></ListItemIcon><ListItemText primary="Logout" /></ListItem>
                </List>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
                {renderContent()}
            </Box>

            {/* Dialogs */}
            {patientToSchedule && (
                <ScheduleAppointmentDialog 
                    patient={patientToSchedule} 
                    doctors={doctors} 
                    onClose={() => setPatientToSchedule(null)} 
                    onScheduleSuccess={handlePatientAction} 
                />
            )}
            
            {patientToEdit && (
                <EditPatientDialog
                    patient={patientToEdit}
                    onClose={() => setPatientToEdit(null)}
                    onUpdate={fetchPatients} 
                />
            )}
            
        </Box>
    );
}

export default StaffDashboard;