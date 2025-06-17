import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  IconButton,
  FormHelperText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../styles/FormStyles.css";
import axios from "axios";

const daysOfWeek = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
];

export default function DoctorForm({ 
  onSaved,
  token
}) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    dni: "",
    phoneNumber: "",
    email: "",
    birthDate: "",
    schedules: [],
  });

  const [errors, setErrors] = useState({ schedules: {}, password: "" });
  const [, setLoading] = useState(false);

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

  const handleScheduleChange = (index, field) => (e) => {
    const value = e.target.value;
    const newSchedules = [...form.schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setForm({ ...form, schedules: newSchedules });

    validateSchedule(index, newSchedules[index]);
  };

  const validateSchedule = (index, schedule) => {
    const newErrors = { ...errors };
    if (!newErrors.schedules) newErrors.schedules = {};

    const { dayOfWeek, entryTime, exitTime } = schedule;

    if (!entryTime || !exitTime) {
    } else if (entryTime >= exitTime) {
      newErrors.schedules[index] = "Hora de entrada debe ser menor que salida";
    } else if (
      form.schedules.some(
        (s, i) => i !== index && s.dayOfWeek === dayOfWeek
      )
    ) {
      newErrors.schedules[index] = "Día de la semana ya seleccionado";
    } else {
      delete newErrors.schedules[index];
    }

    setErrors(newErrors);
  };

  const addSchedule = () => {
    if (form.schedules.length >= 5) return;
    const usados = form.schedules.map((s) => s.dayOfWeek);
    const diaDisponible = daysOfWeek.find((d) => !usados.includes(d.value));
    if (!diaDisponible) return;

    setForm({
      ...form,
      schedules: [
        ...form.schedules,
        { id: crypto.randomUUID(), dayOfWeek: diaDisponible.value, entryTime: "", exitTime: "" }
      ],
    });
  };

  const removeSchedule = (index) => {
    const newSchedules = form.schedules.filter((_, i) => i !== index);
    setForm({ ...form, schedules: newSchedules });

    const newErrors = { ...errors };
    if (newErrors.schedules) {
      delete newErrors.schedules[index];
      const schedulesErrors = {};
      Object.entries(newErrors.schedules).forEach(([key, val]) => {
        const keyNum = Number(key);
        if (keyNum > index) schedulesErrors[keyNum - 1] = val;
        else if (keyNum < index) schedulesErrors[keyNum] = val;
      });
      newErrors.schedules = schedulesErrors;
      setErrors(newErrors);
    }
  };

  const getAvailableDays = (index) => {
    const usadosExceptoActual = form.schedules
      .filter((_, i) => i !== index)
      .map((s) => s.dayOfWeek);
    return daysOfWeek.filter((d) => !usadosExceptoActual.includes(d.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dniRegex.test(form.dni)) {
      setErrors("El DNI debe tener 8 números seguidos de una letra mayúscula.");
      return;
    }

    if (!emailRegex.test(form.email)) {
      setErrors("El correo electrónico no tiene un formato válido.");
      return;
    }
    
    if (!validatePassword()) return;

    const formattedSchedules = form.schedules.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      entryTime: s.entryTime + ":00",
      exitTime: s.exitTime + ":00",
    }));

    const doctorData = {
      username: form.username.trim(),
      password: form.password,
      name: form.name.trim(),
      dni: form.dni.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim(),
      birthDate: form.birthDate,
      schedules: formattedSchedules,
    };

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post(
        "https://tfg-dam-mabedi.onrender.com/auth/register/doctor",
        doctorData,
        config
      );
      onSaved();
    } catch (error) {
      console.error("Error al guardar el doctor:", error);
      alert("Hubo un error al guardar el doctor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="form-container" noValidate>
      <Typography variant="h6" className="section-title">
        Crear / Editar Doctor
      </Typography>

      <TextField
        label="Username"
        name="username"
        value={form.username}
        onChange={handleChange}
        fullWidth
        autoComplete="current-username"
        required
        margin="normal"
      />

      <TextField
        label="Contraseña"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        fullWidth
        required
        autoComplete="current-password"
        margin="normal"
        error={Boolean(errors.password)}
        helperText={errors.password}
      />

      <TextField
        label="Nombre Completo"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="DNI"
        name="dni"
        value={form.dni}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        error={Boolean(errors.password)}
        helperText={errors.password}
      />

      <TextField
        label="Teléfono"
        name="phoneNumber"
        value={form.phoneNumber}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        error={Boolean(errors.password)}
        helperText={errors.password}
      />

      <TextField
        label="Fecha de Nacimiento"
        name="birthdate"
        type="date"
        value={form.birthDate}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <Typography variant="subtitle1" className="section-title" sx={{ mt: 2 }}>
        Horarios (máximo 5, Lunes a Viernes)
      </Typography>

      {form.schedules.map((schedule, idx) => {
        const availableDays = getAvailableDays(idx);
        return (
          <Box key={schedule.id} className="schedule-row" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <TextField
              select
              label="Día de la semana"
              value={schedule.dayOfWeek}
              onChange={handleScheduleChange(idx, "dayOfWeek")}
              sx={{ width: 150 }}
              required
            >
              {[...new Map(
                availableDays
                  .concat(daysOfWeek.find((d) => d.value === schedule.dayOfWeek) || [])
                  .map((d) => [d.value, d])
              ).values()]
                .sort((a, b) => a.value - b.value)
                .map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Entrada"
              type="time"
              value={schedule.entryTime}
              onChange={handleScheduleChange(idx, "entryTime")}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 120 }}
            />

            <TextField
              label="Salida"
              type="time"
              value={schedule.exitTime}
              onChange={handleScheduleChange(idx, "exitTime")}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 120 }}
            />

            <IconButton color="error" onClick={() => removeSchedule(idx)} aria-label="Eliminar horario">
              <DeleteIcon />
            </IconButton>

            {errors.schedules[idx] && (
              <FormHelperText error sx={{ ml: 2 }}>
                {errors.schedules[idx]}
              </FormHelperText>
            )}
          </Box>
        );
      })}

      <Button
        variant="outlined"
        onClick={addSchedule}
        disabled={form.schedules.length >= 5}
        sx={{ mb: 2 }}
      >
        Añadir horario
      </Button>

      <Button type="submit" variant="contained" color="primary" fullWidth>
        Guardar Doctor
      </Button>
    </Box>
  );
}