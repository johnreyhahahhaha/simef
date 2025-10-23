import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from '@mui/material';

const API_BASE = 'http://localhost/project/clinic/backend/api_all.php?route=';

export default function AdminDashboard({ onLogout }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ staff: [], patients: [], appointments: [], vitals: [], records: [] });
  const [editDialog, setEditDialog] = useState(null);
  const [newStaffDialog, setNewStaffDialog] = useState(false);
  const [form, setForm] = useState({});
  const [auditRoleFilter, setAuditRoleFilter] = useState('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [detailDialog, setDetailDialog] = useState(null);
  const activityRef = useRef(null);

  const openRoleAndJump = (role) => {
    setAuditRoleFilter(role);
    // small timeout to allow rendering before scrolling
    setTimeout(() => activityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE + 'admin/audit');
      setData(res.data);
    } catch (e) {
      console.error('Admin audit fetch failed', e);
      setData({ staff: [], patients: [], appointments: [], vitals: [], records: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudit(); }, []);

  const parseDetails = (details) => {
    if (!details) return details;
    try { return JSON.parse(details); } catch (e) { return details; }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Delete staff ID ' + id + '?')) return;
    try {
      // existing delete_staff.php expects { id }
      await axios.post('http://localhost/project/clinic/backend/delete_staff.php', { id });
      fetchAudit();
    } catch (e) {
      alert('Delete failed: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleAddStaff = async () => {
    try {
      await axios.post('http://localhost/project/clinic/backend/add_staff.php', form, { headers: { 'Content-Type': 'application/json' }});
      setNewStaffDialog(false);
      setForm({});
      fetchAudit();
    } catch (e) {
      alert('Add failed: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleEditStaff = (staff) => { setEditDialog(staff); setForm(staff || {}); };
  const handleSaveEdit = async () => {
    try {
      await axios.post('http://localhost/project/clinic/backend/update_staff.php', { ...form, id: editDialog.id });
      setEditDialog(null);
      setForm({});
      fetchAudit();
    } catch (e) {
      alert('Update failed: ' + (e.response?.data?.message || e.message));
    }
  };

  if (loading) return <Box sx={{ p: 4 }}><CircularProgress /> <Typography sx={{ ml: 2 }}>Loading admin audit...</Typography></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Sidebar quick actions for admin */}
        <Grid item xs={12} md={2}>
          <Paper sx={{ p: 2, position: 'sticky', top: 16 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Quick Views</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button variant="outlined" onClick={() => openRoleAndJump('all')}>See All</Button>
              <Button variant="outlined" onClick={() => openRoleAndJump('nurse')}>See Nurses</Button>
              <Button variant="outlined" onClick={() => openRoleAndJump('doctor')}>See Doctors</Button>
              <Button variant="outlined" onClick={() => openRoleAndJump('staff')}>See Staff</Button>
              <Button variant="contained" onClick={() => window.location.href = '/staff-dashboard'}>Open Staff Dashboard</Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={10}>
          <Grid container spacing={3}>
            <Grid item xs={12}><Typography variant="h4">Admin Audit & Management</Typography></Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Staff (recent)</Typography>
              <Box>
                <Button variant="contained" onClick={() => setNewStaffDialog(true)}>Add Staff</Button>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow><TableCell>No.</TableCell><TableCell>ID</TableCell><TableCell>Full Name</TableCell><TableCell>Position</TableCell><TableCell>Email</TableCell><TableCell>Actions</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {data.staff.map((s, idx) => (
                    <TableRow key={s.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{s.id}</TableCell>
                      <TableCell>{s.full_name}</TableCell>
                      <TableCell>{s.position}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleEditStaff(s)}>Edit</Button>
                        <Button size="small" color="error" onClick={() => handleDeleteStaff(s.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Patients (recent)</Typography>
            <TableContainer>
              <Table>
                <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>DOB</TableCell><TableCell>Contact</TableCell></TableRow></TableHead>
                <TableBody>
                  {data.patients.map((p, idx) => (
                    <TableRow key={p.patient_id}><TableCell>{idx + 1}</TableCell><TableCell>{p.patient_id}</TableCell><TableCell>{p.first_name} {p.last_name}</TableCell><TableCell>{p.birth_date}</TableCell><TableCell>{p.contact_number}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Appointments (recent)</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow><TableCell>ID</TableCell><TableCell>Patient</TableCell><TableCell>Doctor</TableCell><TableCell>Date</TableCell><TableCell>Time</TableCell><TableCell>Status</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {data.appointments.map((a, idx) => (
                    <TableRow key={a.appointment_id}><TableCell>{idx + 1}</TableCell><TableCell>{a.appointment_id}</TableCell><TableCell>{a.first_name} {a.last_name}</TableCell><TableCell>{a.doctor_name}</TableCell><TableCell>{a.appointment_date}</TableCell><TableCell>{a.appointment_time}</TableCell><TableCell>{a.status}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Vitals (recent)</Typography>
            <TableContainer>
              <Table>
                <TableHead><TableRow><TableCell>Appointment</TableCell><TableCell>BP</TableCell><TableCell>Temp</TableCell><TableCell>Notes</TableCell></TableRow></TableHead>
                <TableBody>
                  {data.vitals.map((v, idx) => (
                    <TableRow key={v.id}><TableCell>{idx + 1}</TableCell><TableCell>{v.appointment_id} ({v.first_name} {v.last_name})</TableCell><TableCell>{v.blood_pressure}</TableCell><TableCell>{v.temperature}</TableCell><TableCell>{v.nurse_notes}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Records (recent)</Typography>
            <TableContainer>
              <Table>
                <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Patient</TableCell><TableCell>Doctor</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
                <TableBody>
                  {data.records.map((r, idx) => (
                    <TableRow key={r.id}><TableCell>{idx + 1}</TableCell><TableCell>{r.id}</TableCell><TableCell>{r.first_name} {r.last_name}</TableCell><TableCell>{r.doctor_name}</TableCell><TableCell>{r.created_at}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} ref={activityRef}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Staff Dashboard Activity (grouped)</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Quick view of actions performed through the Staff Dashboard by nurses, doctors, and staff.</Typography>

            <Grid container spacing={2}>
              {/** Patient Registrations */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Patient Registrations</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Time</TableCell><TableCell>User</TableCell><TableCell>Patient</TableCell><TableCell>Action</TableCell><TableCell/></TableRow></TableHead>
                      <TableBody>
                        {(data.audit || []).filter(a => a.action === 'patient_register').slice(0,8).map(a => (
                          <TableRow key={a.id}><TableCell>{a.created_at}</TableCell><TableCell>{a.user_name || a.user_id}</TableCell><TableCell>{(parseDetails(a.details)?.patient) || a.details}</TableCell><TableCell>{a.action}</TableCell><TableCell><Button size="small" onClick={() => setDetailDialog(a)}>Details</Button></TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/** Appointments Scheduled */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Appointments Scheduled</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Time</TableCell><TableCell>User</TableCell><TableCell>Details</TableCell><TableCell>Action</TableCell><TableCell/></TableRow></TableHead>
                      <TableBody>
                        {(data.audit || []).filter(a => a.action === 'appointment_schedule').slice(0,8).map(a => (
                          <TableRow key={a.id}><TableCell>{a.created_at}</TableCell><TableCell>{a.user_name || a.user_id}</TableCell><TableCell>{JSON.stringify(parseDetails(a.details) || '')}</TableCell><TableCell>{a.action}</TableCell><TableCell><Button size="small" onClick={() => setDetailDialog(a)}>Details</Button></TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/** Vitals */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Vitals Recorded / Updated</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Time</TableCell><TableCell>User</TableCell><TableCell>Appointment</TableCell><TableCell>BP / Temp</TableCell><TableCell/></TableRow></TableHead>
                      <TableBody>
                        {(data.audit || []).filter(a => a.action && a.action.startsWith('vitals_')).slice(0,8).map(a => {
                          const d = parseDetails(a.details) || {};
                          return (<TableRow key={a.id}><TableCell>{a.created_at}</TableCell><TableCell>{a.user_name || a.user_id}</TableCell><TableCell>{d.appointment_id || ''}</TableCell><TableCell>{(d.bp || d.blood_pressure) + ' / ' + (d.temp || d.temperature)}</TableCell><TableCell><Button size="small" onClick={() => setDetailDialog(a)}>Details</Button></TableCell></TableRow>);
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/** Records created */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Medical Records Created</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Time</TableCell><TableCell>User</TableCell><TableCell>Appointment</TableCell><TableCell>Patient</TableCell><TableCell/></TableRow></TableHead>
                      <TableBody>
                        {(data.audit || []).filter(a => a.action === 'record_create').slice(0,8).map(a => { const d = parseDetails(a.details) || {}; return (<TableRow key={a.id}><TableCell>{a.created_at}</TableCell><TableCell>{a.user_name || a.user_id}</TableCell><TableCell>{d.appointment_id}</TableCell><TableCell>{d.patient_id}</TableCell><TableCell><Button size="small" onClick={() => setDetailDialog(a)}>Details</Button></TableCell></TableRow>); })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/** Patient Updates & Appointment Status */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Patient Updates</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Time</TableCell><TableCell>User</TableCell><TableCell>Patient</TableCell><TableCell>Action</TableCell><TableCell/></TableRow></TableHead>
                      <TableBody>
                        {(data.audit || []).filter(a => a.action === 'patient_update').slice(0,8).map(a => { const d = parseDetails(a.details) || {}; return (<TableRow key={a.id}><TableCell>{a.created_at}</TableCell><TableCell>{a.user_name || a.user_id}</TableCell><TableCell>{d.patient_id}</TableCell><TableCell>{a.action}</TableCell><TableCell><Button size="small" onClick={() => setDetailDialog(a)}>Details</Button></TableCell></TableRow>); })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Appointment Status Changes</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Time</TableCell><TableCell>User</TableCell><TableCell>Appointment</TableCell><TableCell>New Status</TableCell><TableCell/></TableRow></TableHead>
                      <TableBody>
                        {(data.audit || []).filter(a => a.action === 'appointment_status_update').slice(0,8).map(a => { const d = parseDetails(a.details) || {}; return (<TableRow key={a.id}><TableCell>{a.created_at}</TableCell><TableCell>{a.user_name || a.user_id}</TableCell><TableCell>{d.appointment_id}</TableCell><TableCell>{d.status}</TableCell><TableCell><Button size="small" onClick={() => setDetailDialog(a)}>Details</Button></TableCell></TableRow>); })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

            </Grid>
          </Paper>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6">System Audit Log (recent)</Typography>
              <Button variant="outlined" onClick={fetchAudit}>Refresh</Button>
            </Box>

            {/* Filters: role buttons + search */}
            <Box display="flex" gap={1} alignItems="center" sx={{ mb: 2 }}>
              <Button variant={auditRoleFilter === 'all' ? 'contained' : 'outlined'} onClick={() => setAuditRoleFilter('all')}>All</Button>
              <Button variant={auditRoleFilter === 'nurse' ? 'contained' : 'outlined'} onClick={() => setAuditRoleFilter('nurse')}>Nurses</Button>
              <Button variant={auditRoleFilter === 'doctor' ? 'contained' : 'outlined'} onClick={() => setAuditRoleFilter('doctor')}>Doctors</Button>
              <Button variant={auditRoleFilter === 'staff' ? 'contained' : 'outlined'} onClick={() => setAuditRoleFilter('staff')}>Staff</Button>
              <TextField size="small" placeholder="Search action or details..." value={auditSearch} onChange={e => setAuditSearch(e.target.value)} sx={{ ml: 2 }} />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow><TableCell>Time</TableCell><TableCell>User</TableCell><TableCell>Role</TableCell><TableCell>Action</TableCell><TableCell>Details</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {((data.audit || []).filter(a => {
                    // role filter: map user_id -> staff position
                    if (auditRoleFilter !== 'all') {
                      const s = (data.staff || []).find(x => String(x.id) === String(a.user_id));
                      const pos = s?.position?.toLowerCase() || '';
                      if (!pos.includes(auditRoleFilter)) return false;
                    }
                    if (auditSearch) {
                      const hay = (a.action + ' ' + (a.details || '') + ' ' + (a.user_name || '')).toLowerCase();
                      if (!hay.includes(auditSearch.toLowerCase())) return false;
                    }
                    return true;
                  })).map(a => {
                    const s = (data.staff || []).find(x => String(x.id) === String(a.user_id));
                    return (
                      <TableRow key={a.id}><TableCell>{a.created_at}</TableCell><TableCell>{a.user_name || a.user_id}</TableCell><TableCell>{s?.position || 'system'}</TableCell><TableCell>{a.action}</TableCell><TableCell style={{maxWidth:400, overflow:'hidden', textOverflow:'ellipsis'}}>{a.details}</TableCell></TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  </Grid>

      {/* New Staff Dialog */}
      <Dialog open={newStaffDialog} onClose={() => setNewStaffDialog(false)}>
        <DialogTitle>Add New Staff</DialogTitle>
        <DialogContent>
          <TextField label="Full Name" fullWidth margin="dense" value={form.full_name || ''} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <TextField label="Username" fullWidth margin="dense" value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })} />
          <TextField label="Email" fullWidth margin="dense" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
          <TextField label="Position" fullWidth margin="dense" value={form.position || ''} onChange={e => setForm({ ...form, position: e.target.value })} />
          <TextField label="Password" fullWidth margin="dense" type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewStaffDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddStaff}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={!!editDialog} onClose={() => setEditDialog(null)}>
        <DialogTitle>Edit Staff</DialogTitle>
        <DialogContent>
          <TextField label="Full Name" fullWidth margin="dense" value={form.full_name || ''} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <TextField label="Email" fullWidth margin="dense" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
          <TextField label="Position" fullWidth margin="dense" value={form.position || ''} onChange={e => setForm({ ...form, position: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog for Audit Rows */}
      <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} fullWidth maxWidth="md">
        <DialogTitle>Audit Details</DialogTitle>
        <DialogContent>
          {detailDialog && (
            <Box>
              <Typography variant="subtitle2">Action: {detailDialog.action}</Typography>
              <Typography variant="caption" color="textSecondary">Time: {detailDialog.created_at}</Typography>
              <Box sx={{ mt: 2, bgcolor: '#fafafa', p: 2, borderRadius: 1, maxHeight: 400, overflow: 'auto' }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{typeof detailDialog.details === 'string' ? JSON.stringify(parseDetails(detailDialog.details), null, 2) : JSON.stringify(detailDialog.details, null, 2)}</pre>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
