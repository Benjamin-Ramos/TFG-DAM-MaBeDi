import { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";
import "../../styles/FormStyles.css";

export default function PatientForm({ onSaved, token }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    dni: "",
    phoneNumber: "",
    email: "",
    birthDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const dniRegex = /^[0-9]{8}[A-Z]$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validatePassword = (value = form.password) => {
    let errorMsg = "";
    if (!value) {
      errorMsg = "La contraseña es requerida";
    } else if (value.length < 6) {
      errorMsg = "La contraseña debe tener al menos 6 caracteres";
    }
    setErrors((prev) => ({ ...prev, password: errorMsg }));
    return !errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "dni") {
      setErrors((prev) => ({
        ...prev,
        dni: dniRegex.test(value) ? "" : "El DNI debe tener 8 números y una letra mayúscula.",
      }));
    } else if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: emailRegex.test(value) ? "" : "Correo con formato no válido.",
      }));
    } else if (name === "password") {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!dniRegex.test(form.dni)) {
      setErrors((prev) => ({ ...prev, dni: "El DNI debe tener 8 números seguidos de una letra mayúscula." }));
      return;
    }

    if (!emailRegex.test(form.email)) {
      setErrors((prev) => ({ ...prev, email: "El correo electrónico no tiene un formato válido." }));
      return;
    }
    
    if (!validatePassword()) return;

    setLoading(true);

    try {
      const patientData = {
        username: form.username,
        password: form.password,
        name: form.name,
        dni: form.dni,
        phoneNumber: form.phoneNumber,
        email: form.email,
        birthDate: form.birthDate,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        "https://tfg-dam-mabedi.onrender.com/auth/register/patient",
        patientData,
        config
      );
      onSaved();
    } catch (error) {
      console.error("Error al guardar el paciente:", error);
      alert("Hubo un error al guardar el paciente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 500,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
      noValidate
      autoComplete="off"
    >
      <Typography variant="h6" gutterBottom>
        Crear nuevo paciente
      </Typography>

      <TextField
        label="Username"
        name="username"
        value={form.username}
        onChange={handleChange}
        required
        autoComplete="current-username"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        autoComplete="current-password"
        onChange={handleChange}
        required
        error={Boolean(errors.password)}
        helperText={errors.password}
      />
      <TextField
        label="Nombre completo"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <TextField
        label="DNI"
        name="dni"
        value={form.dni}
        onChange={handleChange}
        required
        error={Boolean(errors.dni)}
        helperText={errors.dni}
      />
      <TextField
        label="Teléfono"
        name="phoneNumber"
        value={form.phoneNumber}
        onChange={handleChange}
        required
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
        error={Boolean(errors.email)}
        helperText={errors.email}
      />
      <TextField
        label="Fecha de nacimiento"
        name="birthDate"
        type="date"
        value={form.birthDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        required
      />

      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? "Guardando..." : "Guardar paciente"}
      </Button>
    </Box>
  );
}