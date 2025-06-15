import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, CircularProgress, Alert, Button, TextField } from "@mui/material";
import "../../styles/DoctorProfile.css";

export default function DoctorProfile({ doctorId, token }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  useEffect(() => {
    if (!doctorId) return;
    const fetchDoctor = async () => {
      setLoading(true);
      setError("");
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          `https://tfg-gestion-consultas-medicas.onrender.com/Doctor/doctors/${doctorId}`,
          config
        );
        setDoctor(response.data);
        setOriginalEmail(response.data.email || "");
        setFormData({
          name: response.data.name || "",
          dni: response.data.dni || "",
          phoneNumber: response.data.phoneNumber || "",
          email: response.data.email || "",
          birthDate: response.data.birthDate ? response.data.birthDate.split("T")[0] : "",
        });
      } catch (err) {
        setError("Error al cargar datos del doctor");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId, token]);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (formData.email !== originalEmail) {
      await axios.post(
        "https://tfg-gestion-consultas-medicas.onrender.com/Auth/request-email-change",
        { newEmail: formData.email },
        config
      );

      setActionSuccess(
        "Se ha enviado un enlace de confirmación al nuevo correo electrónico. Revisa tu bandeja para confirmar."
      );
      setEditingProfile(false);
    } else {
      await axios.put(
        `https://tfg-gestion-consultas-medicas.onrender.com/Doctor/doctors/${doctorId}`,
        {
          name: formData.name,
          dni: formData.dni,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          birthDate: formData.birthDate,
        },
        config
      );
      setDoctor({ ...doctor, ...formData });
      setEditingProfile(false);
      setActionSuccess("Perfil actualizado correctamente");
    }
  } catch (err) {
    setActionError(
      err.response?.data || "Error al actualizar perfil o solicitar cambio de correo"
    );
  } finally {
    setActionLoading(false);
  }
};
  
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setActionError("Las nuevas contraseñas no coinciden.");
      return;
    }
    if (!passwordData.currentPassword) {
      setActionError("Ingresa tu contraseña actual.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(
        "https://tfg-gestion-consultas-medicas.onrender.com/Auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        config
      );
      setChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setActionSuccess("Contraseña cambiada correctamente");
    } catch (err) {
      setActionError(
        err.response?.data || "Error al cambiar la contraseña"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ maxWidth: 600 }}>
        {error}
      </Alert>
    );
  }

  if (!doctor) {
    return <Typography>No se encontró el doctor.</Typography>;
  }

  return (
    <Box className="doctor-profile-container">
      {}
      <Box sx={{ backgroundColor: "#2a8dd8", p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
          {doctor.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "white" }}>
          Perfil médico
        </Typography>
      </Box>

      {!editingProfile && !changingPassword && (
        <>
          <Box className="profile-info">
            <Typography><strong>Nombre:</strong> {doctor.name}</Typography>
            <Typography><strong>DNI:</strong> {doctor.dni}</Typography>
            <Typography><strong>Teléfono:</strong> {doctor.phoneNumber}</Typography>
            <Typography><strong>Email:</strong> {doctor.email}</Typography>
            <Typography><strong>Fecha de nacimiento:</strong> {doctor.birthDate?.split("T")[0]}</Typography>
          </Box>
          <Box className="action-buttons">
            <Button variant="contained" onClick={() => { setEditingProfile(true); setActionError(""); setActionSuccess(""); }}>
              Editar Correo
            </Button>
            <Button variant="outlined" onClick={() => { setChangingPassword(true); setActionError(""); setActionSuccess(""); }}>
              Cambiar Contraseña
            </Button>
          </Box>
          {(actionError || actionSuccess) && (
            <Box sx={{ mt: 2 }}>
              {actionError && <Alert severity="error">{actionError}</Alert>}
              {actionSuccess && <Alert severity="success">{actionSuccess}</Alert>}
            </Box>
          )}
        </>
      )}

      {editingProfile && (
        <Box component="form" className="profile-forms" noValidate autoComplete="off" sx={{ mt: 2 }}>
          <TextField
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleProfileChange}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label="DNI"
            name="dni"
            value={formData.dni}
            onChange={handleProfileChange}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label="Teléfono"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleProfileChange}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleProfileChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Fecha de nacimiento"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleProfileChange}
            fullWidth
            margin="normal"
            disabled
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={saveProfile}
              disabled={actionLoading}
              sx={{ mr: 2 }}
            >
              Guardar
            </Button>
            <Button
              variant="outlined"
              onClick={() => setEditingProfile(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
          </Box>
          {(actionError || actionSuccess) && (
            <Box className="alert-container">
              {actionError && <Alert severity="error">{actionError}</Alert>}
              {actionSuccess && <Alert severity="success">{actionSuccess}</Alert>}
            </Box>
          )}
        </Box>
      )}

      {changingPassword && (
        <Box component="form" className="profile-form" noValidate autoComplete="off" sx={{ mt: 2 }}>
          <TextField
            label="Contraseña Actual"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Nueva Contraseña"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Confirmar Nueva Contraseña"
            name="confirmNewPassword"
            type="password"
            value={passwordData.confirmNewPassword}
            onChange={handlePasswordChange}
            fullWidth
            margin="normal"
          />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={changePassword}
              disabled={actionLoading}
              sx={{ mr: 2 }}
            >
              Cambiar
            </Button>
            <Button
              variant="outlined"
              onClick={() => setChangingPassword(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
          </Box>
          {(actionError || actionSuccess) && (
            <Box className="alert-container">
              {actionError && <Alert severity="error">{actionError}</Alert>}
              {actionSuccess && <Alert severity="success">{actionSuccess}</Alert>}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}