// clinic/src/frontend/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardUI from "../frontendUI/DashboardUI";

function Dashboard({ onLogout }) {
  const [open, setOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [staffList, setStaffList] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    password: "",
    date_of_birth: "",
    gender: "",
  });
  const [editingStaff, setEditingStaff] = useState(null);
  const [errors, setErrors] = useState({});

  // 🔍 search state
  const [searchQuery, setSearchQuery] = useState("");

  const toggleDrawer = () => setOpen(!open);

  // Fetch staff kapag nasa Staff menu
  const fetchStaff = () => {
    axios
      .get("http://localhost/project/clinic/backend/get_staff.php")
      .then((res) => {
        if (res.data.success) {
          setStaffList(res.data.staff);
        } else {
          setStaffList([]);
        }
      })
      .catch(() => setStaffList([]));
  };

  useEffect(() => {
    if (selectedMenu === "staff") fetchStaff();
  }, [selectedMenu]);

  // Input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validate required fields
  const validateForm = () => {
    let newErrors = {};
    const requiredFields = [
      "username",
      "full_name",
      "email",
      "phone",
      "address",
      "position",
      "gender",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field]) newErrors[field] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add staff
  const handleAddStaff = () => {
    if (!validateForm()) return;

    axios
      .post("http://localhost/project/clinic/backend/add_staff.php", formData, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        if (res.data.success) {
          fetchStaff();
          setDialogOpen(false);
          setFormData({
            username: "",
            full_name: "",
            email: "",
            phone: "",
            address: "",
            position: "",
            password: "",
            date_of_birth: "",
            gender: "",
          });
          setErrors({});
        } else {
          alert(res.data.message);
        }
      })
      .catch(() => alert("Server error, try again."));
  };

  // Open edit dialog
  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({ ...staff, password: "" });
    setEditDialogOpen(true);
  };

  // Update staff
  const handleUpdateStaff = () => {
    if (!validateForm()) return;

    axios
      .post("http://localhost/project/clinic/backend/update_staff.php", {
        ...formData,
        id: editingStaff.id,
      })
      .then((res) => {
        if (res.data.success) {
          fetchStaff();
          setEditDialogOpen(false);
          setEditingStaff(null);
          setFormData({
            username: "",
            full_name: "",
            email: "",
            phone: "",
            address: "",
            position: "",
            password: "",
            date_of_birth: "",
            gender: "",
          });
        } else {
          alert(res.data.message);
        }
      })
      .catch(() => alert("Server error, try again."));
  };

  // Delete staff
  const handleDeleteStaff = (id) => {
    if (!window.confirm("Are you sure you want to delete this staff?")) return;
    axios
      .post("http://localhost/project/clinic/backend/delete_staff.php", { id })
      .then((res) => {
        if (res.data.success) fetchStaff();
        else alert(res.data.message);
      })
      .catch(() => alert("Server error, try again."));
  };

  // Dynamic columns
  const columns =
    staffList.length > 0
      ? Array.from(
          new Set(staffList.flatMap((staff) => Object.keys(staff)))
        ).filter((col) => col !== "password")
      : [
          "id",
          "username",
          "full_name",
          "email",
          "phone",
          "address",
          "position",
          "date_of_birth",
          "gender",
        ];

  return (
    <DashboardUI
      {...{
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
        searchQuery,     // 🔍 pass searchQuery
        setSearchQuery,  // 🔍 pass setter
      }}
    />
  );
}

export default Dashboard;
