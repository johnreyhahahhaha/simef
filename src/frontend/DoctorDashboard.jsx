import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import {
    Box, AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, Paper, Grid, TextField, Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Alert, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Divider, CircularProgress,
} from "@mui/material";
import {
    Menu as MenuIcon, Dashboard as DashboardIcon, Description as RecordIcon, Logout as LogoutIcon, CheckCircle as CheckCircleIcon, Close as CloseIcon, Event as EventIcon, People as PeopleIcon, Medication as MedicationIcon, Visibility as ViewIcon,
} from "@mui/icons-material";
import { format, differenceInYears, parseISO } from 'date-fns';

// *** BASE API URL ***
const API_BASE_URL = 'http://localhost/project/clinic/backend/api_all.php?route=';

// --- Helper function for age calculation (Using date-fns for accuracy) ---
const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    try {
        // Parse the birthDate string (e.g., '1990-01-01') into a Date object
        const birth = parseISO(birthDate);
        return differenceInYears(new Date(), birth);
    } catch (e) {
        return 'N/A (Invalid Date)';
    }
};

// =========================================================
// --- COMPONENT 1: Medical Record Form (Create/Finalize) ---
// (No changes needed here, copied for completeness)
// =========================================================
const MedicalRecordForm = ({ appointment, doctorId, onClose, onRecordSaved }) => {
    
    const [formData, setFormData] = useState({
        patient_id: appointment.patient_id,
        doctor_id: doctorId, 
        appointment_id: appointment.appointment_id,
        chief_complaint: appointment.reason_for_visit || '', 
        diagnosis: '', 
        treatment_plan: '', 
        prescription: '',
        follow_up_date: '', 
    });
    const [message, setMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.diagnosis || !formData.treatment_plan) {
            setMessage({ severity: 'error', text: 'Diagnosis and Treatment Plan are required.' });
            return;
        }
        
        const dataToSend = { ...formData };
        if (dataToSend.follow_up_date === '') {
            dataToSend.follow_up_date = null; // Send as NULL to PHP
        }

        setIsSubmitting(true);
        setMessage({ severity: 'info', text: 'Saving medical record and completing appointment...' });

        try {
            // POST to 'records/create'
            const response = await axios.post(API_BASE_URL + 'records/create', dataToSend);
            
            setMessage({ severity: 'success', text: response.data.message });
            
            setTimeout(() => {
                onRecordSaved(); 
                onClose();
            }, 1500);

        } catch (error) {
            console.error("Record Save Error:", error);
            setMessage({ severity: 'error', text: 'Saving Failed: ' + (error.response?.data?.message || error.message) });
        } finally {
            setIsSubmitting(false);
        }
    };

    const patientAge = calculateAge(appointment.birth_date);

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ bgcolor: '#e3f2fd' }}>
                <Typography variant="h5">Consultation for: **{appointment.patient_name || `${appointment.first_name || ''} ${appointment.last_name || ''}`}**</Typography>
                <Typography variant="subtitle2" color="textSecondary">Appointment ID: {appointment.appointment_id}</Typography>
            </DialogTitle>
            <DialogContent dividers>
                {message && <Alert severity={message.severity} sx={{ mb: 2 }}>{message.text}</Alert>}

                {/* Patient Demographics & Initial Complaint (Staff's Job) */}
                <Paper elevation={3} sx={{ p: 3, mb: 3, borderLeft: '5px solid #1976d2' }}>
                    <Typography variant="h6" gutterBottom color="primary">Patient Demographics & Staff Intake</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="body2">**DOB / Age:** {appointment.birth_date} ({patientAge} y.o.)</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="body2">**Gender:** {appointment.gender || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2">**Contact:** {appointment.contact_number || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <TextField 
                                fullWidth 
                                label="Chief Complaint (Staff Intake Notes)" 
                                name="chief_complaint" 
                                value={formData.chief_complaint} 
                                multiline rows={2} disabled 
                                helperText="This is the initial reason for visit as noted by the Staff during booking/intake."
                                sx={{ bgcolor: '#fffde7' }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
                
                <Typography variant="h6" gutterBottom color="error">Doctor's Clinical Notes (Required)</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        {/* Doctor's exclusive updates */}
                        <Grid item xs={12}><TextField fullWidth label="Diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} multiline rows={3} required helperText="Enter your official diagnosis for the patient." /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Treatment Plan" name="treatment_plan" value={formData.treatment_plan} onChange={handleChange} multiline rows={3} required helperText="Outline the recommended procedures or therapy." /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Prescription (Optional)" name="prescription" value={formData.prescription} onChange={handleChange} multiline rows={3} helperText="List of medications and dosages." /></Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Follow-up Date (Optional)" 
                                name="follow_up_date" 
                                type="date" 
                                value={formData.follow_up_date} 
                                onChange={handleChange} 
                                InputLabelProps={{ shrink: true }} 
                                helperText="Set a date for the patient's next visit, if required."
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
                            {isSubmitting ? <CircularProgress size={24} /> : 'Save Record & Complete Appointment'}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};


// =========================================================
// --- COMPONENT 2: Medical Record Display (View) --- 
// (No changes needed here, copied for completeness)
// =========================================================
const MedicalRecordDisplay = ({ appointmentId, onClose }) => {
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecord = async () => {
            setLoading(true);
            setError(null);
            try {
                // GET record by appointment ID using the API route
                const response = await axios.get(API_BASE_URL + `records/get&id=${appointmentId}`);
                
                if (!response.data || Object.keys(response.data).length === 0) {
                     throw new Error("API returned no data for this appointment ID.");
                }

                setRecord(response.data);
                
            } catch (err) {
                console.error("Error fetching record:", err);
                
                let errorMessage = 'Failed to fetch medical record.';
                
                if (err.response) {
                    if (err.response.status === 404) {
                        errorMessage = `Error 404: Record not found. Medical record for appointment ID ${appointmentId} has not been finalized yet.`;
                    } else {
                        errorMessage = `HTTP Error ${err.response.status}: ` + (err.response.data?.message || err.message);
                    }
                } else if (err.request) {
                    errorMessage = "Network Error: Could not connect to the API. Check if the backend server is running.";
                } else {
                    errorMessage = `Client Error: ${err.message}`;
                }
                
                setError(errorMessage);
                setRecord(null);
            } finally {
                setLoading(false);
            }
        };

        if (appointmentId) {
            fetchRecord();
        }
    }, [appointmentId]);
    
    const getPatientDetails = () => {
        if (!record) return null;
        const age = calculateAge(record.birth_date);
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} sm={3}><Typography variant="body2">**Patient ID:** {record.patient_id}</Typography></Grid>
                <Grid item xs={12} sm={3}><Typography variant="body2">**Age:** {age} y.o.</Typography></Grid>
                <Grid item xs={12} sm={3}><Typography variant="body2">**Gender:** {record.gender || 'N/A'}</Typography></Grid>
                <Grid item xs={12} sm={3}><Typography variant="body2">**Record Date:** {record.created_at ? format(new Date(record.created_at), 'MMM dd, yyyy') : 'N/A'}</Typography></Grid>
            </Grid>
        );
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ bgcolor: '#bbdefb' }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">MEDICAL RECORD: {record ? `${record.first_name} ${record.last_name}` : 'Loading...'}</Typography>
                    <Typography variant="subtitle1" color="textPrimary">{record?.doctor_name ? `Attending Physician: Dr. ${record.doctor_name}` : ''}</Typography>
                </Grid>
            </DialogTitle>
            <DialogContent dividers>
                {loading && (
                    <Box display="flex" justifyContent="center" alignItems="center" height={200}><CircularProgress /><Typography sx={{ ml: 2 }}>Loading medical record details...</Typography></Box>
                )}
                
                {error && <Alert severity="error">{error}</Alert>}
                
                {record && (
                    <Box>
                        {/* Patient Demographics */}
                        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd' }}>
                            <Typography variant="subtitle1" color="primary" gutterBottom>Patient Information</Typography>
                            {getPatientDetails()}
                        </Paper>
                        
                        {/* Chief Complaint (Staff Input) */}
                        <Typography variant="h6" gutterBottom color="textSecondary">I. Chief Complaint (Staff Notes)</Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>{record.chief_complaint || 'N/A'}</Alert>

                        {/* Doctor's Notes */}
                        <Typography variant="h6" gutterBottom color="primary">II. Doctor's Clinical Findings</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>A. Diagnosis</Typography>
                                <Paper variant="outlined" sx={{ p: 2, minHeight: 100, bgcolor: '#ffffff' }}><Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{record.diagnosis}</Typography></Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>B. Treatment Plan</Typography>
                                <Paper variant="outlined" sx={{ p: 2, minHeight: 100, bgcolor: '#ffffff' }}><Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{record.treatment_plan}</Typography></Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>C. Prescription</Typography>
                                <Paper variant="outlined" sx={{ p: 2, minHeight: 100, bgcolor: '#ffffff' }}><Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{record.prescription || 'No prescription issued.'}</Typography></Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>D. Follow-up</Typography>
                                <Typography variant="body1">
                                    {record.follow_up_date ? `Scheduled Follow-up Date: **${record.follow_up_date}**` : 'No specific follow-up date set.'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} startIcon={<CloseIcon />}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};


// =========================================================
// --- COMPONENT 3: Doctor Appointments List (Table) ---
// (No changes needed here, copied for completeness)
// =========================================================
const DoctorAppointmentList = ({ appointments, onComplete, onRecordView }) => {
    
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Scheduled': return { color: 'green', fontWeight: 'bold' };
            case 'Completed': return { color: 'darkgray', fontWeight: 'bold' };
            case 'Cancelled': 
            case 'No-Show': return { color: 'red', fontWeight: 'bold' };
            default: return { color: 'gray' };
        }
    };

    return (
        <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: '#e0f7fa' }}>
                        <TableCell>Date</TableCell><TableCell>Time</TableCell><TableCell>Patient Name</TableCell><TableCell>DOB (Age)</TableCell><TableCell>Reason (Staff Note)</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {appointments.length === 0 ? (
                        <TableRow><TableCell colSpan={7} align="center">No appointments found in this category.</TableCell></TableRow>
                    ) : (
                        appointments.map((app) => (
                            <TableRow key={app.appointment_id} sx={{ bgcolor: app.status === 'Scheduled' ? '#fffde7' : '#f5f5f5' }}>
                                <TableCell>{app.appointment_date}</TableCell>
                                <TableCell>{app.appointment_time}</TableCell>
                                <TableCell><strong>{app.patient_name || `${app.first_name || ''} ${app.last_name || ''}`}</strong></TableCell>
                                <TableCell>{app.birth_date} ({calculateAge(app.birth_date)})</TableCell>
                                <TableCell>{app.reason_for_visit}</TableCell>
                                <TableCell><span style={getStatusStyle(app.status)}>{app.status}</span></TableCell>
                                <TableCell>
                                    {app.status === 'Scheduled' && (
                                        <Tooltip title="Start Consultation & Create Medical Record">
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                color="primary" 
                                                onClick={() => onComplete(app)} 
                                                startIcon={<RecordIcon />}
                                            >
                                                Consult
                                            </Button>
                                        </Tooltip>
                                    )}

                                    {/* If nurse has done vitals but status is Vitals Done, show View Intake so doctor can review before consulting */}
                                    {app.status === 'Vitals Done' && (
                                        <>
                                            <Tooltip title="View Nurse Intake (Vitals) before consulting">
                                                <Button size="small" variant="outlined" color="info" onClick={() => onRecordView({ type: 'intake', id: app.appointment_id, raw: app })} sx={{ mr: 1 }} startIcon={<ViewIcon />}>View Intake</Button>
                                            </Tooltip>
                                            {/* Allow doctor to start consult after reviewing intake; keep Consult disabled until doctor explicitly starts it */}
                                            <Tooltip title={app.vitals ? 'Start Consultation (you have intake data)' : 'No intake recorded yet'}>
                                                <span>
                                                    <Button 
                                                        size="small" 
                                                        variant="contained" 
                                                        color="primary" 
                                                        onClick={() => onComplete(app)} 
                                                        startIcon={<RecordIcon />}
                                                        disabled={!app.vitals}
                                                    >
                                                        Consult
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </>
                                    )}

                                    {/* View finalized record for completed appointments */}
                                    {app.status !== 'Scheduled' && app.status !== 'Vitals Done' && (
                                        <Tooltip title="View Finalized Medical Record (Only available for Completed status)">
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                color="secondary" 
                                                onClick={() => onRecordView(app.appointment_id)} 
                                                startIcon={<ViewIcon />}
                                                disabled={app.status !== 'Completed'}
                                            >
                                                View Record
                                            </Button>
                                        </Tooltip>
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
// --- NEW COMPONENT 4: Patient History List ---
// Gagamitin ang lahat ng unique na pasyente mula sa appointments
// =========================================================
const PatientHistoryList = ({ appointments, onRecordView }) => {
    // Kumuha ng unique patients
    const uniquePatients = Array.from(
        appointments.reduce((map, app) => {
            if (!map.has(app.patient_id)) {
                map.set(app.patient_id, {
                    ...app,
                    record_count: 1,
                    last_visit_date: app.appointment_date,
                    last_appointment_id: app.appointment_id,
                });
            } else {
                // I-update ang record count at huling visit date
                const existing = map.get(app.patient_id);
                existing.record_count += 1;
                if (app.appointment_date > existing.last_visit_date) {
                    existing.last_visit_date = app.appointment_date;
                    existing.last_appointment_id = app.appointment_id;
                }
            }
            return map;
        }, new Map()).values()
    );

    // I-sort by last visit date (pinakabago ang una)
    uniquePatients.sort((a, b) => (a.last_visit_date < b.last_visit_date ? 1 : -1));

    return (
        <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: '#e1f5fe' }}>
                        <TableCell>Patient ID</TableCell><TableCell>Patient Name</TableCell><TableCell>DOB (Age)</TableCell><TableCell>Gender</TableCell><TableCell>Total Consults</TableCell><TableCell>Last Visit Date</TableCell><TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {uniquePatients.length === 0 ? (
                        <TableRow><TableCell colSpan={7} align="center">No patient records found yet.</TableCell></TableRow>
                    ) : (
                        uniquePatients.map((patient) => (
                            <TableRow key={patient.patient_id}>
                                <TableCell>{patient.patient_id}</TableCell>
                                <TableCell><strong>{patient.patient_name || `${patient.first_name || ''} ${patient.last_name || ''}`}</strong></TableCell>
                                <TableCell>{patient.birth_date} ({calculateAge(patient.birth_date)})</TableCell>
                                <TableCell>{patient.gender}</TableCell>
                                <TableCell>{patient.record_count}</TableCell>
                                <TableCell>{patient.last_visit_date}</TableCell>
                                <TableCell>
                                    <Tooltip title="View the Medical Record of the last completed consultation.">
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            color="info" 
                                            onClick={() => onRecordView(patient.last_appointment_id)} 
                                            startIcon={<ViewIcon />}
                                            disabled={patient.last_appointment_id === null || patient.status !== 'Completed'}
                                        >
                                            View Last Record
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
// --- NEW COMPONENT 5: Prescription List ---
// Gagamitin ang lahat ng prescription na na-save mula sa records
// =========================================================
const PrescriptionList = ({ completedAppointments, onRecordView }) => {
    // I-filter ang mga appointment na may prescription at i-sort by date (pinakabago ang una)
    const prescriptions = completedAppointments
        .filter(app => app.prescription && app.prescription.trim() !== '' && app.status === 'Completed')
        .sort((a, b) => (a.appointment_date < b.appointment_date ? 1 : -1));

    return (
        <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: '#fff3e0' }}>
                        <TableCell>Date</TableCell><TableCell>Patient Name</TableCell><TableCell>Diagnosis</TableCell><TableCell>Prescription Snippet</TableCell><TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {prescriptions.length === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center">No prescriptions have been issued yet in completed consultations.</TableCell></TableRow>
                    ) : (
                        prescriptions.map((app) => (
                            <TableRow key={app.appointment_id}>
                                <TableCell>{app.appointment_date}</TableCell>
                                <TableCell><strong>{app.patient_name || `${app.first_name || ''} ${app.last_name || ''}`}</strong></TableCell>
                                {/* NOTE: Sa totoong app, kailangan natin ng API para i-fetch ang Diagnosis ng record.
                                    Dahil wala, gagamitin muna natin ang 'reason_for_visit' as placeholder. 
                                    (Assuming na ang 'app' object ay galing sa doctor/appointments API na may Diagnosis field kung updated)
                                */}
                                <TableCell>{app.diagnosis || app.reason_for_visit}</TableCell>
                                <TableCell>
                                    <Tooltip title={app.prescription}>
                                        <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {app.prescription}
                                        </Typography>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Button 
                                        size="small" 
                                        variant="outlined" 
                                        color="warning" 
                                        onClick={() => onRecordView(app.appointment_id)} 
                                        startIcon={<ViewIcon />}
                                    >
                                        View Record
                                    </Button>
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
// --- MAIN COMPONENT: DoctorDashboard ---
// =========================================================
function DoctorDashboard({ onLogout, userId }) {
    const [open, setOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState("dashboard");
    const [allAppointments, setAllAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recordDialog, setRecordDialog] = useState(null); 
    const [viewRecordDialog, setViewRecordDialog] = useState(null); 
    const [intakeDialog, setIntakeDialog] = useState(null);
    const [doctorName, setDoctorName] = useState(userId ? `Doctor ID ${userId}` : "Unknown Doctor"); 

    const toggleDrawer = () => setOpen(!open);

    // --- Data Fetching Logic (Gumagamit ng userId) ---
    const fetchAppointments = useCallback(async () => {
        if (!userId || userId === 'null' || userId === 'undefined') { 
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // API Call: GET doctor-specific appointments 
            const response = await axios.get(API_BASE_URL + `doctor/appointments&doctor_id=${userId}`);
            
            // NOTE: Kung ang backend ay hindi nag-u-update ng 'allAppointments' na may 
            // 'diagnosis' at 'prescription' fields pagkatapos ng record creation, 
            // kailangan pa rin ng hiwalay na call para sa kumpletong data.
            // Assuming for now na kasama na sa response.data ang fields na 'diagnosis' at 'prescription'.
            setAllAppointments(response.data); 
            
            if (response.data.length > 0 && response.data[0].doctor_name) {
                setDoctorName(response.data[0].doctor_name); 
            } else {
                setDoctorName(`Doctor ID ${userId}`);
            }
            
        } catch (error) { 
            console.error("Error fetching doctor appointments:", error); 
            setAllAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);
    
    // --- Data Filtering ---
    const today = format(new Date(), 'yyyy-MM-dd');
    const pendingAppointments = allAppointments.filter(app => 
        app.status === 'Scheduled' && (app.appointment_date >= today || app.appointment_date === null)
    );
    const todayAppointments = allAppointments.filter(app => app.appointment_date === today && app.status === 'Scheduled');
    const pastAppointments = allAppointments.filter(app => app.status !== 'Scheduled'); 
    // Gagamitin ito para sa Patients at Prescriptions tabs
    const completedAppointments = allAppointments.filter(app => app.status === 'Completed');

    // --- Handlers ---
    const handleStartConsultation = (appointment) => {
        setRecordDialog(appointment);
    };
    
    const handleViewRecord = (payload) => {
        // payload can be either appointmentId (number) for finalized records
        // or an object {type: 'intake', id, raw} for nurse intake preview
        if (payload && typeof payload === 'object' && payload.type === 'intake') {
            setIntakeDialog(payload.raw || { appointment_id: payload.id });
        } else {
            setViewRecordDialog(payload);
        }
    };

    const handleRecordSaved = () => {
        fetchAppointments(); 
    };

    // --- Content Renderer (UPDATED) ---
    const renderContent = () => {
        if (!userId || userId === 'null' || userId === 'undefined') {
            return (
                <Box sx={{ mt: 5 }}>
                    <Alert severity="warning">
                        <Typography variant="h6">Session Error: Doctor ID Missing</Typography>
                        User ID not found in session. Please **Logout and Log in again** to fix this.
                    </Alert>
                </Box>
            );
        }
        
        if (loading) return <Typography variant="h5" sx={{ mt: 3 }}>Loading schedule... Please wait. ⏳</Typography>;


        switch (selectedMenu) {
            case "dashboard":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Welcome, **Dr. {doctorName}** 👨‍⚕️</Typography>
                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={4}><Paper sx={{ p: 3, textAlign: 'center', borderTop: '5px solid #1976d2' }}>**Appointments Today:** <Typography variant="h4" color="primary">{todayAppointments.length}</Typography></Paper></Grid>
                            <Grid item xs={12} md={4}><Paper sx={{ p: 3, textAlign: 'center', borderTop: '5px solid #ff9800' }}>**Pending Appointments:** <Typography variant="h4" color="secondary">{pendingAppointments.length}</Typography></Paper></Grid>
                            <Grid item xs={12} md={4}><Paper sx={{ p: 3, textAlign: 'center', borderTop: '5px solid #4caf50' }}>**Completed Consultations:** <Typography variant="h4" color="success.main">{completedAppointments.length}</Typography></Paper></Grid>
                        </Grid>
                        <Paper sx={{ p: 3, mt: 3, bgcolor: '#e8f5e9' }}>
                            <Typography variant="h6" color="success.dark">Action Required:</Typography>
                            {todayAppointments.length > 0 ? (
                                <Alert severity="warning">You have **{todayAppointments.length}** patient(s) waiting today. Go to **Upcoming Consults** to begin.</Alert>
                            ) : (
                                <Alert severity="success">No patients currently scheduled for today. Review upcoming or past records.</Alert>
                            )}
                        </Paper>
                    </Box>
                );
            case "appointments":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Upcoming Consultations (Scheduled)</Typography>
                        <DoctorAppointmentList 
                            appointments={pendingAppointments} 
                            onComplete={handleStartConsultation} 
                            onRecordView={handleViewRecord}
                        />
                        <Alert severity="info" sx={{ mt: 3 }}>Use the **Consult** button to start a consultation and create a medical record for the patient.</Alert>
                    </Box>
                );
            case "reports":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Past Consultations (Records to Review)</Typography>
                        <DoctorAppointmentList 
                            appointments={pastAppointments} 
                            onComplete={handleStartConsultation} 
                            onRecordView={handleViewRecord}
                        />
                        <Alert severity="info" sx={{ mt: 3 }}>Click **View Record** on 'Completed' appointments to see the full consultation details. Appointments with 'Cancelled' or 'No-Show' status may not have records.</Alert>
                    </Box>
                );
            case "patients":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Patients (All Records)</Typography>
                        <Alert severity="info" sx={{ p: 2 }}>🧍 List of all unique patients you have treated. Click "View Last Record" to see their latest consultation details.</Alert>
                        <PatientHistoryList
                            appointments={completedAppointments}
                            onRecordView={handleViewRecord}
                        />
                    </Box>
                );
            case "prescriptions":
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>Prescriptions Issued</Typography>
                        <Alert severity="info" sx={{ p: 2 }}>💊 List of prescriptions you have issued in your completed consultations.</Alert>
                        <PrescriptionList
                            completedAppointments={completedAppointments}
                            onRecordView={handleViewRecord}
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
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: "linear-gradient(45deg, #1976d2, #42a5f5)", }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}><MenuIcon /></IconButton>
                    <Typography variant="h6" noWrap>Doctor Dashboard - **Dr. {doctorName}**</Typography>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Drawer variant="temporary" open={open} onClose={toggleDrawer} sx={{"& .MuiDrawer-paper": { width: 240, boxSizing: "border-box", backgroundColor: "#e3f2fd", }, }}>
                <Toolbar />
                <List>
                    <ListItem button onClick={() => setSelectedMenu("dashboard")} selected={selectedMenu === "dashboard"}>
                        <ListItemIcon><DashboardIcon color={selectedMenu === "dashboard" ? "primary" : "inherit"} /></ListItemIcon>
                        <ListItemText primary="Dashboard Overview" />
                    </ListItem>
                    <ListItem button onClick={() => setSelectedMenu("appointments")} selected={selectedMenu === "appointments"}>
                        <ListItemIcon><EventIcon color={selectedMenu === "appointments" ? "primary" : "inherit"} /></ListItemIcon>
                        <ListItemText primary="Upcoming Consults" />
                    </ListItem>
                    <ListItem button onClick={() => setSelectedMenu("reports")} selected={selectedMenu === "reports"}>
                        <ListItemIcon><RecordIcon color={selectedMenu === "reports" ? "primary" : "inherit"} /></ListItemIcon>
                        <ListItemText primary="Past Records" />
                    </ListItem>
                    <ListItem button onClick={() => setSelectedMenu("patients")} selected={selectedMenu === "patients"}>
                        <ListItemIcon><PeopleIcon color={selectedMenu === "patients" ? "primary" : "inherit"} /></ListItemIcon>
                        <ListItemText primary="Patients (History)" />
                    </ListItem>
                    <ListItem button onClick={() => setSelectedMenu("prescriptions")} selected={selectedMenu === "prescriptions"}>
                        <ListItemIcon><MedicationIcon color={selectedMenu === "prescriptions" ? "primary" : "inherit"} /></ListItemIcon>
                        <ListItemText primary="Prescriptions" />
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

            {/* Medical Record Dialog (CREATE/FINALIZE) */}
            {recordDialog && (
                <MedicalRecordForm 
                    appointment={recordDialog} 
                    doctorId={userId} 
                    onClose={() => setRecordDialog(null)} 
                    onRecordSaved={handleRecordSaved} 
                />
            )}
            
            {/* Medical Record Dialog (VIEW) */}
            {viewRecordDialog && (
                <MedicalRecordDisplay
                    appointmentId={viewRecordDialog} 
                    onClose={() => setViewRecordDialog(null)}
                />
            )}

            {/* Intake Dialog: show nurse vitals/notes so doctor can review before consult */}
            {intakeDialog && (
                <Dialog open onClose={() => setIntakeDialog(null)} fullWidth maxWidth="md">
                    <DialogTitle> Nurse Intake / Vitals for Appointment {intakeDialog.appointment_id} </DialogTitle>
                    <DialogContent dividers>
                        {intakeDialog.vitals ? (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle1"><strong>Blood Pressure:</strong> {intakeDialog.vitals.blood_pressure}</Typography>
                                <Typography variant="subtitle1"><strong>Temperature:</strong> {intakeDialog.vitals.temperature}</Typography>
                                <Typography variant="subtitle1"><strong>Weight:</strong> {intakeDialog.vitals.weight || 'N/A'}</Typography>
                                <Typography variant="subtitle1"><strong>Height:</strong> {intakeDialog.vitals.height || 'N/A'}</Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1"><strong>Nurse Notes:</strong></Typography>
                                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>{intakeDialog.vitals.nurse_notes || 'No notes provided.'}</Paper>
                            </Box>
                        ) : (
                            <Alert severity="info">No intake/vitals recorded yet for this appointment.</Alert>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIntakeDialog(null)}>Close</Button>
                        <Button onClick={() => { setRecordDialog(intakeDialog); setIntakeDialog(null); }} variant="contained" color="primary">Start Consult</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}

export default DoctorDashboard;