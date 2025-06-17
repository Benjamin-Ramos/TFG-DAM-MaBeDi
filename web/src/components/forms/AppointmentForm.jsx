import { useState, useEffect } from "react";
import { TextField, Button, MenuItem, Stack, Typography } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import esLocale from "date-fns/locale/es";
import axios from "axios";

export default function AppointmentForm({
  doctors = [],
  patients = [],
  role,
  currentDoctorId,
  onSaved,
  token,
}) {
  const patientsArray = patients && Array.isArray(patients?.$values) ? patients.$values : patients || [];
  const [selectedDoctorId, setSelectedDoctorId] = useState(() =>
    role === "Doctor" ? currentDoctorId || "" : ""
  );
  const [doctor, setDoctor] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [dateTime, setDateTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "Doctor" || !currentDoctorId) return;
    const fetchDoctor = async () => {
      setLoading(true);
      setError("");
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          `https://tfg-dam-mabedi.onrender.com/Doctor/doctors/${currentDoctorId}`,
          config
        );
        setDoctor(response.data);
        setSelectedDoctorId(currentDoctorId);
      } catch (err) {
        setError("Error al cargar datos del doctor");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [role, currentDoctorId, token]);

  const roundToHalfHour = (date) => {
    const rounded = new Date(date);
    const minutes = rounded.getMinutes();
    if (minutes < 15) {
      rounded.setMinutes(0);
    } else if (minutes < 45) {
      rounded.setMinutes(30);
    } else {
      rounded.setHours(rounded.getHours() + 1);
      rounded.setMinutes(0);
    }
    rounded.setSeconds(0);
    rounded.setMilliseconds(0);
    return rounded;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctorId || !selectedPatientId || !dateTime) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const roundedDateTime = roundToHalfHour(dateTime);

    const appointmentData = {
      patientId: selectedPatientId,
      doctorId: selectedDoctorId,
      appointmentDateTime: new Date(roundedDateTime.getTime() - roundedDateTime.getTimezoneOffset() * 60000).toISOString(),
      status: "Programada",
    };

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post(
        "https://tfg-dam-mabedi.onrender.com/Appointment/appointments/register",
        appointmentData,
        config
      );
      onSaved();
    } catch (error) {
      console.error("Error al guardar la cita:", error);
      alert("Hubo un error al guardar la cita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p />
      <Stack spacing={2}>
        {role !== "Doctor" ? (
          <TextField
            select
            label="Doctor"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            required
          >
            {doctors.map((doc) => (
              <MenuItem key={doc.id} value={doc.id}>
                {doc.name}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <>
            {loading ? (
              <Typography>Cargando doctor...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <Typography>
                Doctor: {doctor?.name || "Nombre no disponible"}
              </Typography>
            )}
          </>
        )}

        <TextField
          select
          label="Paciente"
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          required
        >
          {patientsArray.map((pat) => (
            <MenuItem key={pat.id} value={pat.id}>
              {pat.name}
            </MenuItem>
          ))}
        </TextField>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
          <DateTimePicker
            label="Fecha y hora"
            value={dateTime}
            onChange={(newValue) => setDateTime(newValue)}
            minutesStep={30}
            disablePast
            ampm={false}
          />
        </LocalizationProvider>

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cita"}
        </Button>
      </Stack>
    </form>
  );
}