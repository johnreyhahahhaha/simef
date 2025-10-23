// clinic/src/frontend/dashboard/DashboardUI.jsx
import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

function DashboardUI({
  open,
  toggleDrawer,
  selectedMenu,
  setSelectedMenu,
  staffList,
  formData,
  errors,
  columns,
  dialogOpen,
  setDialogOpen,
  editDialogOpen,
  setEditDialogOpen,
  handleAddStaff,
  handleChange,
  handleUpdateStaff,
  handleOpenEdit,
  handleDeleteStaff,
  onLogout,
  searchQuery,
  setSearchQuery,
}) {
  // 🔍 Filter staff list based on search query
  const filteredStaff = staffList.filter((staff) =>
    Object.values(staff)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(45deg, #2196F3, #21CBF3)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => setSelectedMenu("dashboard")}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => setSelectedMenu("staff")}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Staff" />
          </ListItem>
          <ListItem button onClick={() => setSelectedMenu("settings")}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem button onClick={onLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          minHeight: "100vh",
          backgroundColor: "#f4f6f8",
        }}
      >
        {selectedMenu === "dashboard" && (
          <>
            <Typography variant="h4" gutterBottom>
              Welcome, Admin 👋
            </Typography>
            <Typography>
              This is your admin dashboard. Click the menu icon to toggle the
              sidebar.
            </Typography>
          </>
        )}

        {selectedMenu === "staff" && (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
              flexWrap="wrap"
              gap={2}
            >
              <Typography variant="h4" gutterBottom>
                Staff Management
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                {/* 🔍 Modern Search Bar */}
                <TextField
                  variant="outlined"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    width: 350,
                    backgroundColor: "white",
                    borderRadius: "50px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "50px",
                      paddingRight: "8px",
                    },
                    "& input": {
                      padding: "10px 14px",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ color: "gray", mr: 1 }} fontSize="small" />
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogOpen(true)}
                  sx={{ background: "linear-gradient(45deg, #4caf50, #81c784)" }}
                >
                  Add Staff
                </Button>
              </Box>
            </Box>

            {/* Staff Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No.</TableCell>
                    {columns.map((col) => (
                      <TableCell key={col}>
                        {col
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </TableCell>
                    ))}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        {columns.map((col) => (
                          <TableCell key={col}>{staff[col] ?? "-"}</TableCell>
                        ))}
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEdit(staff)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteStaff(staff.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} align="center">
                        No staff found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Add Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <DialogTitle>Add New Staff</DialogTitle>
              <DialogContent>
                {[
                  { name: "username", label: "Username" },
                  { name: "full_name", label: "Full Name" },
                  { name: "email", label: "Email" },
                  { name: "phone", label: "Phone" },
                  { name: "address", label: "Address" },
                  { name: "position", label: "Position" },
                  { name: "password", label: "Password", type: "password" },
                ].map((field) => (
                  <TextField
                    key={field.name}
                    margin="dense"
                    name={field.name}
                    label={field.label}
                    type={field.type || "text"}
                    fullWidth
                    required
                    value={formData[field.name]}
                    onChange={handleChange}
                    error={!!errors[field.name]}
                    helperText={errors[field.name] || ""}
                  />
                ))}
                <TextField
                  margin="dense"
                  name="date_of_birth"
                  label="Date of Birth"
                  type="date"
                  fullWidth
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  select
                  margin="dense"
                  name="gender"
                  label="Gender"
                  fullWidth
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  error={!!errors.gender}
                  helperText={errors.gender || ""}
                  SelectProps={{ native: true }}
                >
                  <option value=""></option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </TextField>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddStaff} variant="contained">
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
              open={editDialogOpen}
              onClose={() => setEditDialogOpen(false)}
            >
              <DialogTitle>Edit Staff</DialogTitle>
              <DialogContent>
                {[
                  { name: "username", label: "Username" },
                  { name: "full_name", label: "Full Name" },
                  { name: "email", label: "Email" },
                  { name: "phone", label: "Phone" },
                  { name: "address", label: "Address" },
                  { name: "position", label: "Position" },
                ].map((field) => (
                  <TextField
                    key={field.name}
                    margin="dense"
                    name={field.name}
                    label={field.label}
                    type={field.type || "text"}
                    fullWidth
                    required
                    value={formData[field.name]}
                    onChange={handleChange}
                    error={!!errors[field.name]}
                    helperText={errors[field.name] || ""}
                  />
                ))}
                <TextField
                  margin="dense"
                  name="date_of_birth"
                  label="Date of Birth"
                  type="date"
                  fullWidth
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  select
                  margin="dense"
                  name="gender"
                  label="Gender"
                  fullWidth
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  error={!!errors.gender}
                  helperText={errors.gender || ""}
                  SelectProps={{ native: true }}
                >
                  <option value=""></option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </TextField>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateStaff} variant="contained">
                  Update
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {selectedMenu === "settings" && (
          <>
            <Typography variant="h4" gutterBottom>
              Settings
            </Typography>
            <Typography>System settings go here.</Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export default DashboardUI;
