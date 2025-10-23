// src/frontend/login.jsx
import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

// --- API Endpoints ---
const ADMIN_API = "http://localhost/project/clinic/backend/api.php"; 
const STAFF_API = "http://localhost/project/clinic/backend/staff_api.php"; // Para sa Doctor, Nurse, Staff, Patient

function Login({ onLoginSuccess }) {
  const [role, setRole] = useState("doctor"); // Default to 'doctor' for easy testing
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("role", role);

      let apiUrl = role === "admin" ? ADMIN_API : STAFF_API;

      const response = await axios.post(apiUrl, formData);

      if (response.data.success) {
        setMessage("✅ " + response.data.message);

  // 1. Kumuha ng user data. Use the selected role as the canonical role if API position is missing.
  const apiPosition = response.data.user?.position?.toLowerCase();
  const userPosition = role === "admin" ? "admin" : (apiPosition || role);
        
        // 🔑 FIX 1: Tiyakin na string ang userId; kunin ang ID na binabalik ng PHP.
        // Dapat ang PHP mo ay nagbabalik ng Doctor ID (e.g., 23) sa loob ng response.data.user.id
        const userId = response.data.user?.id ? String(response.data.user.id) : null; 
        
        // Admin ID ay placeholder lang (depende sa setup mo)
    if (role === 'admin') {
      localStorage.setItem("user_id", "admin");
    } else if (userId) {
      localStorage.setItem("user_id", userId);
    } else {
      // If API didn't return an id (e.g., patient), still store a placeholder id so session persists
      localStorage.setItem("user_id", response.data.user?.id ? String(response.data.user.id) : 'unknown');
    }

    // Save role (use selected role as authoritative fallback)
    localStorage.setItem("user_role", userPosition);
        
        // 🔑 FIX 2: I-call ang onLoginSuccess. Tiyakin na nare-render ang App component.
    if (onLoginSuccess) onLoginSuccess();

        // 🔑 FIX 3: Tamang navigation logic
        if (userPosition === "admin") {
          navigate("/dashboard");
        } else if (userPosition === "staff") {
          navigate("/staff-dashboard");
        } else if (userPosition === "doctor") {
          navigate("/doctor-dashboard");
        } else if (userPosition === "nurse") {
          navigate("/nurse-dashboard");
        } else if (userPosition === "patient") {
          navigate("/patient-dashboard");
        } else {
          navigate("/");
        }
      } else {
        setMessage("❌ " + response.data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      // Pwedeng mag-check kung error.response.data para mas specific ang error message
      setMessage("⚠️ Server error. Please check your network or API paths.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Paper
          elevation={12}
          sx={{
            p: 5,
            width: 420,
            borderRadius: 6,
            textAlign: "center",
            backgroundColor: "rgba(255,255,255,0.95)",
            boxShadow:
              "0 10px 25px rgba(0,0,0,0.1), inset 0 0 8px rgba(25,118,210,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#1976d2",
              width: 75,
              height: 75,
              margin: "0 auto",
              mb: 2,
              boxShadow: "0 3px 10px rgba(25,118,210,0.3)",
            }}
          >
            <LocalHospitalIcon sx={{ fontSize: 42 }} />
          </Avatar>

          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#1565c0",
              letterSpacing: 0.5,
            }}
          >
            Banquerohan Clinic
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            Secure Login Portal
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleLogin}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Login as</InputLabel>
              <Select
                labelId="role-label"
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
                required
                sx={{
                  borderRadius: 2,
                  "& .MuiSelect-select": { py: 1 },
                }}
              >
                <MenuItem value="admin">👨‍💼 Admin</MenuItem>
                <MenuItem value="staff">👩 Staff</MenuItem>
                <MenuItem value="doctor">👨‍⚕️ Doctor</MenuItem>
                <MenuItem value="nurse">👩‍⚕️ Nurse</MenuItem>
                <MenuItem value="patient">🧑 Patient</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              sx={{
                borderRadius: 2,
                "& .MuiInputBase-root": { borderRadius: 2 },
              }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                borderRadius: 2,
                "& .MuiInputBase-root": { borderRadius: 2 },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                borderRadius: 3,
                py: 1.5,
                background:
                  "linear-gradient(45deg, #1976d2, #42a5f5, #64b5f6)",
                fontWeight: "bold",
                fontSize: "16px",
                textTransform: "none",
                transition: "0.3s",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0, #1e88e5, #42a5f5)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              🔐 Login
            </Button>
          </form>

          {message && (
            <Typography
              variant="body2"
              align="center"
              sx={{
                mt: 3,
                color: message.includes("✅") ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {message}
            </Typography>
          )}

          <Divider sx={{ mt: 4, mb: 2 }} />

          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            © 2025 Brgy. Banquerohan Clinic • Confidential Access
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default Login;