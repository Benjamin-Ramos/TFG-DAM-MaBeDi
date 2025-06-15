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

const daysOfWeek = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
];

export default function DoctorForm({ onSaved }) {
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

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });

    if (field === "password") {
      validatePassword(e.target.value);
    }
  };

  const validatePassword = (value) => {
    let errorMsg = "";
    if (!value) {
      errorMsg = "La contraseña es requerida";
    } else if (value.length < 6) {
      errorMsg = "La contraseña debe tener al menos 6 caracteres";
    }
    setErrors((prev) => ({ ...prev, password: errorMsg }));
    return !errorMsg;
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
        { dayOfWeek: diaDisponible.value, entryTime: "", exitTime: "" },
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

  const validateForm = () => {
    let valid = true;

    form.schedules.forEach((schedule, i) => {
      validateSchedule(i, schedule);
    });

    if (!validatePassword(form.password)) valid = false;

    if (Object.keys(errors.schedules).length > 0) valid = false;

    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formattedSchedules = form.schedules.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      entryTime: s.entryTime + ":00",
      exitTime: s.exitTime + ":00",
    }));

    const dataToSend = {
      username: form.username.trim(),
      password: form.password,
      name: form.name.trim(),
      dni: form.dni.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim(),
      birthDate: form.birthDate,
      schedules: formattedSchedules,
    };

    onSaved(dataToSend);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="form-container" noValidate>
      <Typography variant="h6" className="section-title">
        Crear / Editar Doctor
      </Typography>

      <TextField
        label="Username"
        value={form.username}
        onChange={handleChange("username")}
        fullWidth
        autoComplete="current-username"
        required
        margin="normal"
      />

      <TextField
        label="Contraseña"
        type="password"
        value={form.password}
        onChange={handleChange("password")}
        fullWidth
        required
        autoComplete="current-password"
        margin="normal"
        error={Boolean(errors.password)}
        helperText={errors.password}
      />

      <TextField
        label="Nombre Completo"
        value={form.name}
        onChange={handleChange("name")}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="DNI"
        value={form.dni}
        onChange={handleChange("dni")}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Teléfono"
        value={form.phoneNumber}
        onChange={handleChange("phoneNumber")}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={handleChange("email")}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Fecha de Nacimiento"
        type="date"
        value={form.birthDate}
        onChange={handleChange("birthDate")}
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
          <Box key={`schedule-${schedule.dayOfWeek}-${idx}`} className="schedule-row" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
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