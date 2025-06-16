import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, CircularProgress, Grid, Alert } from "@mui/material";

import FormDoctor from "../components/DoctorForm";
import TableDoctors from "../components/DoctorTable";
import FormPatient from "../components/PatientForm";
import TablePatients from "../components/PatientTable";
import FormAppointment from "../components/AppointmentForm";
import TableAppointments from "../components/AppointmentTable";

export default function Dashboard({ token, role }) {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
        axios.get("https://tfg-dam-mabedi.onrender.com/Doctor/doctors", config),
        axios.get("https://tfg-dam-mabedi.onrender.com/Patient/patients", config),
        axios.get("https://tfg-dam-mabedi.onrender.com/Appointment/appointments", config),
      ]);

      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
      setAppointments(appointmentsRes.data);
    } catch (err) {
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== "Administrator") {
      setError("No tienes permisos para ver esta información.");
      setLoading(false);
      return;
    }
    fetchAllData();
  }, [token, role]);

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Dashboard Administrativo</Typography>

      <Grid container spacing={4}>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Doctores</Typography>
            <FormDoctor token={token} onDoctorAdded={fetchAllData} />
            <TableDoctors doctors={doctors} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Pacientes</Typography>
            <FormPatient token={token} onPatientAdded={fetchAllData} />
            <TablePatients patients={patients} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Citas</Typography>
            <FormAppointment
              token={token}
              doctors={doctors}
              patients={patients}
              onAppointmentAdded={fetchAllData}
            />
            <TableAppointments appointments={appointments} />
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}