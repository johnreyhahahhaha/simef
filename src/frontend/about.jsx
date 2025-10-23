// src/frontend/About.jsx
import React from "react";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Grid,
  Card,
  TextField,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HealingIcon from "@mui/icons-material/Healing";
import PeopleIcon from "@mui/icons-material/People";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

function About() {
  const navigate = useNavigate();

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  return (
    <Box sx={{ width: "100vw", overflowX: "hidden", bgcolor: "#fafafa" }}>
      {/* 🔹 Navbar */}
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          background: "rgba(21, 101, 192, 0.95)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              letterSpacing: 0.5,
            }}
          >
            <LocalHospitalIcon sx={{ mr: 1 }} />
            Banquerohan Clinic
          </Typography>

          <Box sx={{ display: "flex", gap: { xs: 1, md: 3 }, flexWrap: "wrap" }}>
            {["about", "services", "contact"].map((item) => (
              <Button
                key={item}
                color="inherit"
                onClick={() => handleScroll(item)}
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: "20px",
                  },
                }}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Button>
            ))}
            <Button color="inherit" onClick={() => navigate("/login")} sx={{ fontWeight: 600 }}>
              Login
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#fff",
                color: "#1565c0",
                fontWeight: "bold",
                borderRadius: "25px",
                px: { xs: 2, md: 3 },
                py: { xs: 0.5, md: 1 },
                textTransform: "none",
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              Book a Doctor
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 🔹 Hero Section */}
      <Box
        id="hero"
        sx={{
          pt: { xs: 14, md: 18 },
          px: { xs: 3, md: 8 },
          pb: 12,
          backgroundImage:
            "linear-gradient(rgba(13,71,161,0.75), rgba(13,71,161,0.75)), url('https://img.freepik.com/free-photo/healthcare-workers-with-stethoscope-hospital_23-2149130347.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
          textAlign: { xs: "center", md: "left" },
        }}
      >
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              lineHeight: 1.3,
              fontSize: { xs: "2.2rem", md: "3.2rem" },
            }}
          >
            Caring for Every Family in Banquerohan
          </Typography>
          <Typography sx={{ mt: 2, fontSize: { xs: "16px", md: "18px" }, opacity: 0.9 }}>
            Accessible, reliable, and compassionate healthcare — serving the community with
            modern medical expertise and heartfelt care.
          </Typography>
          <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: { xs: "center", md: "flex-start" } }}>
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                background: "#fff",
                color: "#1565c0",
                borderRadius: "30px",
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": { background: "#e3f2fd" },
              }}
            >
              Proceed to Login
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleScroll("about")}
              sx={{
                color: "#fff",
                borderColor: "#fff",
                borderRadius: "30px",
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": { background: "rgba(255,255,255,0.15)" },
              }}
            >
              Learn More
            </Button>
          </Box>
        </motion.div>
      </Box>

      {/* 🔹 About Section */}
      <Box
        id="about"
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 10 },
          background: "linear-gradient(180deg, #f7fbff 0%, #ffffff 100%)",
          textAlign: "center",
        }}
      >
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Typography variant="h4" fontWeight="bold" color="#0d47a1" mb={2}>
            About Our Clinic
          </Typography>
          <Typography
            sx={{
              maxWidth: 800,
              mx: "auto",
              mb: 6,
              color: "text.secondary",
              fontSize: { xs: "16px", md: "18px" },
              lineHeight: 1.8,
            }}
          >
            Banquerohan Clinic is dedicated to providing quality and affordable healthcare to every
            resident of the community. Our professional medical team ensures compassionate care,
            trust, and innovation in every service we provide.
          </Typography>
        </motion.div>

        <Grid container spacing={4} justifyContent="center">
          {[ 
            {
              icon: <EmojiObjectsIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
              title: "Our Mission",
              desc: "Deliver accessible and high-quality healthcare with compassion and integrity.",
            },
            {
              icon: <VisibilityIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
              title: "Our Vision",
              desc: "To become a trusted model of community healthcare excellence in Legazpi.",
            },
            {
              icon: <VolunteerActivismIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
              title: "Our Values",
              desc: "Integrity, Compassion, Service, and Excellence — at the heart of every patient encounter.",
            },
          ].map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Paper
                  elevation={5}
                  sx={{
                    p: 4,
                    borderRadius: "20px",
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {item.icon}
                  <Typography variant="h6" fontWeight="bold" mt={2}>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary" mt={1}>
                    {item.desc}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 🔹 Services Section (4 cards aligned) */}
      <Box id="services" sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 8 }, bgcolor: "#f9fbfd" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#0d47a1",
            mb: 6,
            textAlign: "center",
          }}
        >
          Our Medical Services
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {[
            {
              icon: <MedicalServicesIcon />,
              title: "General Consultation",
              desc: "Comprehensive check-ups by licensed physicians.",
            },
            {
              icon: <HealingIcon />,
              title: "Emergency Care",
              desc: "Immediate response for urgent medical needs.",
            },
            {
              icon: <FavoriteIcon />,
              title: "Maternal & Child Health",
              desc: "Dedicated care for mothers and children.",
            },
            {
              icon: <PeopleIcon />,
              title: "Community Programs",
              desc: "Health outreach and wellness education.",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Card
                elevation={6}
                sx={{
                  width: 250,
                  textAlign: "center",
                  p: 4,
                  borderRadius: "20px",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor: "#e3f2fd",
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    mx: "auto",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1976d2",
                    fontSize: 40,
                  }}
                >
                  {s.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.desc}
                </Typography>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* 🔹 Contact Section */}
      <Box id="contact" sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 8 }, bgcolor: "#fff" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#0d47a1",
            mb: 6,
            textAlign: "center",
          }}
        >
          Contact Us
        </Typography>

        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: "20px" }} elevation={4}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Visit or Reach Us
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <LocationOnIcon sx={{ color: "#1976d2", mr: 1 }} />
                Brgy. Banquerohan, Legazpi City
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <PhoneIcon sx={{ color: "#1976d2", mr: 1 }} />
                +63 912 345 6789
              </Typography>
              <Typography sx={{ mb: 3 }}>
                <EmailIcon sx={{ color: "#1976d2", mr: 1 }} />
                clinic@banquerohan.ph
              </Typography>

              <Box
                component="img"
                src="https://tse2.mm.bing.net/th/id/OIP.iFoQkVbU4t1ome-ygPSkzAHaFY?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Map"
                sx={{
                  width: "100%",
                  borderRadius: "15px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: "20px" }} elevation={4}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Send Us a Message
              </Typography>
              <TextField label="Your Name" fullWidth sx={{ mb: 2 }} />
              <TextField label="Your Email" fullWidth sx={{ mb: 2 }} />
              <TextField label="Message" fullWidth multiline rows={4} sx={{ mb: 2 }} />
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                  px: 4,
                  py: 1.5,
                  borderRadius: "25px",
                  fontWeight: "bold",
                }}
              >
                Send Message
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 🔹 Footer */}
      <Box sx={{ py: 3, textAlign: "center", color: "#fff", bgcolor: "#0d47a1" }}>
        <Typography variant="caption">
          © 2025 Brgy. Banquerohan Clinic • All Rights Reserved
        </Typography>
      </Box>
    </Box>
  );
}

export default About;
