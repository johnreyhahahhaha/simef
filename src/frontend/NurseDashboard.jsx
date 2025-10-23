import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import {
    Box, AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, Paper, Grid, TextField, Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Alert, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Divider,
} from "@mui/material";
import {
    Menu as MenuIcon, Dashboard as DashboardIcon, People as PeopleIcon, LocalHospital as VitalsIcon, EventNote as ScheduleIcon, Inventory as InventoryIcon, Logout as LogoutIcon, CheckCircle as CheckCircleIcon, Close as CloseIcon, Edit as EditIcon, FastForward as ProceedIcon
} from "@mui/icons-material";
import { format } from 'date-fns';

// *** BASE API URL (Tiyakin na tama ang path na ito) ***
const API_BASE_URL = 'http://localhost/project/clinic/backend/api_all.php?route=';

// =========================================================
// --- COMPONENT 1: Vitals and Intake Form ---
// =========================================================
const VitalsForm = ({ appointment, nurseId, onClose, onVitalsSubmitted }) => {
    
    // Tiyakin na ang initial state ay gumagamit ng optional chaining para sa appointment.vitals
    const [formData, setFormData] = useState({
        appointment_id: appointment.appointment_id,
        nurse_id: nurseId, 
        blood_pressure: appointment.vitals?.blood_pressure || '',
        temperature: appointment.vitals?.temperature || '',
        weight: appointment.vitals?.weight || '',
        height: appointment.vitals?.height || '',
        nurse_notes: appointment.vitals?.nurse_notes || '',
    });
    const [message, setMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.blood_pressure || !formData.temperature) {
            setMessage({ severity: 'error', text: 'Blood Pressure and Temperature are required.' });
            return;
        }

        setIsSubmitting(true);
        // Ipinapaalam na ang pasyente ay ipo-proceed sa Doctor
        setMessage({ severity: 'info', text: 'Saving patient vitals and notes, and updating status for Doctor review...' });

        try {
            // Gumamit ng POST method para mag-insert/update ng vitals at mag-update ng status
            const response = await axios.post(API_BASE_URL + 'nurse/vitals', formData);
            
            setMessage({ severity: 'success', text: response.data.message });
            
            setTimeout(() => {
                onVitalsSubmitted(); // Trigger refresh in parent
                onClose(); // Close the modal
            }, 1500);

        } catch (error) {
            console.error("Vitals Save Error:", error);
            setMessage({ severity: 'error', text: 'Saving Failed: ' + (error.response?.data?.message || error.message) });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ bgcolor: '#e0f2f1' }}>
                <Typography variant="h5">Vitals & Intake for: **{appointment.patient_name}**</Typography>
                <Typography variant="subtitle2" color="textSecondary">Appointment ID: {appointment.appointment_id} | Date: {appointment.appointment_date}</Typography>
            </DialogTitle>
            <DialogContent dividers>
                {message && <Alert severity={message.severity} sx={{ mb: 2 }}>{message.text}</Alert>}
                
                <Typography variant="h6" gutterBottom color="primary">Patient Measurements (Required)</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Blood Pressure (e.g., 120/80)" name="blood_pressure" value={formData.blood_pressure} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Temperature (°C)" name="temperature" value={formData.temperature} onChange={handleChange} required type="number" inputProps={{ step: "0.1" }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} type="number" inputProps={{ step: "0.1" }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Height (cm)" name="height" value={formData.height} onChange={handleChange} type="number" />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="h6" gutterBottom color="secondary">Nurse Observations/Notes (For Doctor)</Typography>
                            <TextField 
                                fullWidth 
                                label="Nurse Notes / Chief Complaint Details" 
                                name="nurse_notes" 
                                value={formData.nurse_notes} 
                                onChange={handleChange} 
                                multiline 
                                rows={4} 
                                helperText="Initial observations, patient reported symptoms, pain scale, etc."
                            />
                        </Grid>
                    </Grid>
                    <DialogActions sx={{ mt: 3, p: 0 }}>
                        <Button onClick={onClose} color="error" startIcon={<CloseIcon />}>Cancel</Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="success" 
                            startIcon={<CheckCircleIcon />}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Save Vitals & Proceed to Doctor'}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};


// =========================================================
// --- COMPONENT 2: Nurse Appointment List ---
// =========================================================
const NurseAppointmentList = ({ appointments, onProcessVitals }) => {
    
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Scheduled': return { color: 'green', fontWeight: 'bold' };
            case 'Vitals Done': return { color: '#ff9800', fontWeight: 'bold' }; // Orange for pending Doctor
            case 'Completed': return { color: 'darkgray', fontWeight: 'bold' };
            default: return { color: 'gray' };
        }
    };
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const appointmentsToday = appointments
        .filter(app => app.appointment_date === today)
        .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

    return (
        <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: '#e0f7fa' }}>
                        <TableCell>Time</TableCell><TableCell>Patient Name</TableCell><TableCell>Doctor</TableCell><TableCell>Reason</TableCell><TableCell>Current Status</TableCell><TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {appointmentsToday.length === 0 ? (
                        <TableRow><TableCell colSpan={6} align="center">No appointments scheduled for today.</TableCell></TableRow>
                    ) : (
                        appointmentsToday.map((app) => (
                            <TableRow key={app.appointment_id} sx={{ bgcolor: app.status === 'Scheduled' ? '#fffde7' : (app.status === 'Vitals Done' ? '#e3f2fd' : '#e8f5e9') }}>
                                <TableCell><strong>{app.appointment_time}</strong></TableCell>
                                <TableCell>{app.patient_name}</TableCell>
                                <TableCell>Dr. {app.doctor_name}</TableCell>
                                <TableCell>{app.reason_for_visit}</TableCell>
                                <TableCell><span style={getStatusStyle(app.status)}>{app.status}</span></TableCell>
                                <TableCell>
                                    <Tooltip title={app.status === 'Scheduled' ? "Record Vitals and Nurse Notes" : "Edit Vitals/Notes"}>
                                        <Button 
                                            size="small" 
                                            variant="contained" 
                                            color={app.status === 'Scheduled' ? 'primary' : 'warning'} 
                                            onClick={() => onProcessVitals(app)} 
                                            startIcon={app.status === 'Scheduled' ? <ProceedIcon /> : <EditIcon />}
                                            // Disable button if appointment is completed or cancelled
                                            disabled={app.status === 'Completed' || app.status === 'Cancelled'} 
                                        >
                                            {app.status === 'Scheduled' ? 'Start Intake' : (app.status === 'Completed' ? 'Completed' : 'Edit Vitals')}
                                        </Button>
                                    </Tooltip>
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
// --- MAIN COMPONENT: NurseDashboard ---
// =========================================================
function NurseDashboard({ onLogout, userId }) {
    const [open, setOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState("dashboard");
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vitalsDialog, setVitalsDialog] = useState(null); 
    
    // Nurse ID from props
    const currentNurseId = userId; 

    const toggleDrawer = () => setOpen(!open);

    // --- Data Fetching Logic (Appointments/Schedule) ---
    const fetchTodayAppointments = useCallback(async () => {
        if (!currentNurseId) return;
        setLoading(true);
        try {
            // Route to fetch all appointments for today
            const response = await axios.get(API_BASE_URL + `appointments/today`); 
            
            // ADJUSTED: PHP backend already formats patient_name and embeds vitals.
            const processedAppointments = response.data.map(app => ({
                ...app,
                // Ensure 'vitals' is an object for VitalsForm, though PHP should handle this
                vitals: app.vitals || {} 
            }));
            
            setTodayAppointments(processedAppointments); 
            
        } catch (error) { 
            console.error("Error fetching today's appointments:", error); 
            // In case of error, still set loading to false but clear data
            setTodayAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [currentNurseId]);

    useEffect(() => {
        fetchTodayAppointments();
    }, [fetchTodayAppointments]);
    
    // --- Handlers ---
    const handleProcessVitals = (appointment) => {
        setVitalsDialog(appointment);
    };
    
    const handleVitalsSubmitted = () => {
        fetchTodayAppointments(); // Refresh the list
    };

    // --- Content Renderer ---
    const renderContent = () => {
        
        if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /><Typography variant="h6" sx={{ ml: 2 }}>Loading appointments...</Typography></Box>;

        const scheduledCount = todayAppointments.filter(app => app.status === 'Scheduled').length;
        const vitalsDoneCount = todayAppointments.filter(app => app.status === 'Vitals Done').length;
        
        switch (selectedMenu) {
            case "dashboard":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Welcome, Nurse 👩‍⚕️</Typography>
                        <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>**Your ID:** {currentNurseId || "N/A"}</Typography>
                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={4}><Paper sx={{ p: 3, textAlign: 'center', borderTop: '5px solid #009688' }}>**Appointments for Today:** <Typography variant="h4" color="primary">{todayAppointments.length}</Typography></Paper></Grid>
                            <Grid item xs={12} md={4}><Paper sx={{ p: 3, textAlign: 'center', borderTop: '5px solid #ff9800' }}>**Pending Intake:** <Typography variant="h4" color="secondary">{scheduledCount}</Typography></Paper></Grid>
                            <Grid item xs={12} md={4}><Paper sx={{ p: 3, textAlign: 'center', borderTop: '5px solid #2196f3' }}>**Waiting for Doctor:** <Typography variant="h4" color="info">{vitalsDoneCount}</Typography></Paper></Grid>
                        </Grid>
                        <Paper sx={{ p: 3, mt: 3, bgcolor: '#e8f8f7' }}>
                            <Typography variant="h6" color="success.dark">Status Update:</Typography>
                            {scheduledCount > 0 ? (
                                <Alert severity="warning">You have **{scheduledCount}** patient(s) needing **Intake/Vitals** today. Please proceed to **Today's Intake**.</Alert>
                            ) : (
                                <Alert severity="success">All vitals for today's scheduled patients have been initiated. Good job!</Alert>
                            )}
                        </Paper>
                    </Box>
                );
            case "triage":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Today's Intake (Vitals & Triage)</Typography>
                        <NurseAppointmentList 
                            appointments={todayAppointments} 
                            onProcessVitals={handleProcessVitals} 
                        />
                        <Alert severity="info" sx={{ mt: 3 }}>Click **Start Intake** to record Vitals (BP, Temp, Weight, etc.) and Nurse Notes. This action marks the patient as **'Vitals Done'** and queues them for the Doctor.</Alert>
                    </Box>
                );
            case "patients":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>All Registered Patients</Typography>
                        <Paper sx={{ p: 3 }}>👥 Dito ilalagay ang Patient Management Table, kung saan puwedeng mag-edit o mag-register ng bagong patient.</Paper>
                    </Box>
                );
            case "inventory":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Inventory</Typography>
                        <Paper sx={{ p: 3 }}>📦 Dito ilalagay ang stock management table at forms para sa supplies at medicines.</Paper>
                    </Box>
                );
            case "schedule":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Duty Schedule</Typography>
                        <Paper sx={{ p: 3 }}>🗓️ Dito makikita ang work shifts ng mga nurses at staff.</Paper>
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
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: "linear-gradient(45deg, #009688, #1de9b6)", }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}><MenuIcon /></IconButton>
                    <Typography variant="h6" noWrap>Nurse Dashboard</Typography>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Drawer variant="temporary" open={open} onClose={toggleDrawer} sx={{"& .MuiDrawer-paper": { width: 240, boxSizing: "border-box", backgroundColor: "#e0f2f1", }, }}>
                <Toolbar />
                <List>
                    <ListItem button onClick={() => setSelectedMenu("dashboard")} selected={selectedMenu === "dashboard"}>
                        <ListItemIcon><DashboardIcon color={selectedMenu === "dashboard" ? "primary" : "inherit"} /></ListItemIcon>
                        <ListItemText primary="Dashboard Overview" />
                    </ListItem>
                    <Divider />
                    <ListItem button onClick={() => setSelectedMenu("triage")} selected={selectedMenu === "triage"}>
                        <ListItemIcon><VitalsIcon color={selectedMenu === "triage" ? "primary" : "inherit"} /></ListItemIcon>
                        <ListItemText primary="Today's Intake (Vitals)" />
                    </ListItem>
                    <ListItem button onClick={() => setSelectedMenu("patients")} selected={selectedMenu === "patients"}>
                        <ListItemIcon><PeopleIcon color={selectedMenu === "patients" ? "primary" : "inherit"} /></ListItemIcon>
                        <ListItemText primary="Patient Records" />
                    </ListItem>
                    <Divider />
                    <ListItem button onClick={() => setSelectedMenu("inventory")} selected={selectedMenu === "inventory"}>
                        <ListItemIcon><InventoryIcon color={selectedMenu === "inventory" ? "primary" : "inherit"} /></ListItemIcon>
                        <ListItemText primary="Inventory" />
                    </ListItem>
                    <ListItem button onClick={() => setSelectedMenu("schedule")} selected={selectedMenu === "schedule"}>
                        <ListItemIcon><ScheduleIcon color={selectedMenu === "schedule" ? "primary" : "inherit"} /></ListItemIcon>
                        <ListItemText primary="Duty Schedule" />
                    </ListItem>
                    <ListItem button onClick={onLogout}>
                        <ListItemIcon><LogoutIcon /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItem>
                </List>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
                {renderContent()}
            </Box>
            
            {/* Vitals Input Dialog */}
            {vitalsDialog && (
                <VitalsForm 
                    appointment={vitalsDialog} 
                    nurseId={currentNurseId} 
                    onClose={() => setVitalsDialog(null)} 
                    onVitalsSubmitted={handleVitalsSubmitted} 
                />
            )}

        </Box>
    );
}

export default NurseDashboard;