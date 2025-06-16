import { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";
import "../../styles/FormStyles.css";

export default function PatientForm({ onSaved }) {
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
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.post(
        "https://tfg-dam-mabedi.onrender.com/auth/register/patient",
        form,
        config
      );

      onSaved(response.data);
      setForm({
        username: "",
        password: "",
        name: "",
        dni: "",
        phoneNumber: "",
        email: "",
        birthDate: "",
      });
    } catch (err) {
      console.error(err);
      setError("Error al crear el paciente. Revisa los datos.");
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

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? "Guardando..." : "Guardar paciente"}
      </Button>
    </Box>
  );
}