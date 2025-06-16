import { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from "@mui/material";

import DoctorTable from "./components/tables/DoctorTable";
import PatientTable from "./components/tables/PatientTable";
import AppointmentTable from "./components/tables/AppointmentTable";

import DoctorForm from "./components/forms/DoctorForm";
import PatientForm from "./components/forms/PatientForm";
import AppointmentForm from "./components/forms/AppointmentForm";
import DoctorProfile from "./components/tables/DoctorProfile";

import ScheduleTable from "./components/schedule/ScheduleTable";
import "./styles/App.css";

export default function App({ token, role, onLogout, doctorId }) {
  const colors = {
    primary: "#ff9800",
    secondary: "#9c27b0",
    danger: "#d32f2f",
    blue: "#2a8dd8",
    background: "#f5f5f5",
    tabIndicator: "#1976d2",
    buttonText: "#fff",
  };

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tabIndex, setTabIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(null);

  const isAdmin = role === "Administrator";
  const isDoctor = role === "Doctor";

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchAppointments = async () => {
    try {
      let apptRes;
      if (isDoctor) {
        apptRes = await axios.get(
          `https://tfg-dam-mabedi.onrender.com/Appointment/appointments/doctor/${doctorId}`,
          config
        );
      } else {
        apptRes = await axios.get(
          "https://tfg-dam-mabedi.onrender.com/Appointment/appointments",
          config
        );
      }
      setAppointments(apptRes.data?.$values || []);
    } catch (err) {
      console.error("Error cargando citas:", err);
      setError("Error al cargar las citas");
    }
  };

  useEffect(() => {
    if (!isAdmin && !isDoctor) {
      setError("No tienes permisos para ver esta información.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const docRes = isAdmin
          ? await axios.get(
              "https://tfg-dam-mabedi.onrender.com/Doctor/doctors",
              config
            )
          : { data: [] };

        const patRes = await axios.get(
          "https://tfg-dam-mabedi.onrender.com/Patient/patients",
          config
        );
        await fetchAppointments();
        setDoctors(Array.isArray(docRes.data.$values) ? docRes.data.$values : []);
        setPatients(Array.isArray(patRes.data.$values) ? patRes.data.$values : []);

        if (isDoctor) {
          const scheduleRes = await axios.get(
            `https://tfg-dam-mabedi.onrender.com/Doctor/doctors/${doctorId}`,
            config
          );
          setDoctorSchedule(scheduleRes.data.schedules || []);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, role, doctorId]);

  const handleUpdateDoctor = async (updatedDoctor) => {
    try {
      await axios.put(
        `https://tfg-dam-mabedi.onrender.com/Doctor/update/${updatedDoctor.id}`,
        updatedDoctor,
        config
      );
      setDoctors((prev) =>
        prev.map((doc) => (doc.id === updatedDoctor.id ? updatedDoctor : doc))
      );
    } catch (error) {
      console.error("Error actualizando doctor:", error);
      alert("Error al actualizar doctor");
    }
  };

  const handleUpdatePatient = async (updatedPatient) => {
    try {
      await axios.put(
        `https://tfg-dam-mabedi.onrender.com/Patient/update/${updatedPatient.id}`,
        updatedPatient,
        config
      );
      setPatients((prev) =>
        prev.map((pat) => (pat.id === updatedPatient.id ? updatedPatient : pat))
      );
    } catch (error) {
      console.error("Error actualizando paciente:", error);
      alert("Error al actualizar paciente");
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      await axios.delete(
        `https://tfg-dam-mabedi.onrender.com/Patient/delete/${patientId}`,
        config
      );
      setPatients((prev) => (Array.isArray(prev) ? prev.filter((p) => p.id !== patientId) : []));
    } catch (error) {
      console.error("Error eliminando paciente:", error);
      alert("Error al eliminar paciente");
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      await axios.delete(
        `https://tfg-dam-mabedi.onrender.com/Doctor/doctors/${doctorId}`,
        config
      );
      setDoctors((prev) => (Array.isArray(prev) ? prev.filter((d) => d.id !== doctorId) : []));
    } catch (error) {
      console.error("Error eliminando al doctor:", error);
      alert("Error al eliminar al doctor");
    }
  };

  const handleChange = (_, newValue) => {
    setTabIndex(newValue);
    setOpenDialog(null);
  };

  const handleDialogOpen = (type) => setOpenDialog(type);
  const handleDialogClose = () => setOpenDialog(null);

  const handleSaveDoctor = async (newDoc) => {
    try {
      const response = await axios.post(
        "https://tfg-dam-mabedi.onrender.com/auth/register/doctor",
        newDoc,
        config
      );
      if (!Array.isArray(doctors)) {
        setDoctors([response.data]);
      } else {
        setDoctors((prev) => [...prev, response.data]);
      }
      handleDialogClose();
    } catch (error) {
      console.error("Error guardando doctor:", error);
      alert("Error al guardar doctor");
    }
  };

  const handleSavePatient = async (newPat) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const response = await axios.post(
      "https://tfg-dam-mabedi.onrender.com/auth/register/patient",
      newPat,
      config
    );

    if (!Array.isArray(patients)) {
      setPatients([response.data]);
    } else {
      setPatients((prev) => [...prev, response.data]);
    }

    handleDialogClose();
  } catch (error) {
    console.error("Error guardando paciente:", error);
    alert("Error al guardar paciente");
  }
};

  const handleSaveAppointment = async (newAppointment) => {
    await fetchAppointments();
    handleDialogClose();
  };

  const tabsForAdmin = [
    {
      label: "Doctores",
      component: (
        <DoctorTable
          doctors={doctors}
          onUpdateDoctor={handleUpdateDoctor}
          onDeleteDoctor={handleDeleteDoctor}
        />
      ),
    },
    {
      label: "Pacientes",
      component: (
        <PatientTable
          patients={patients}
          onUpdatePatient={handleUpdatePatient}
          onDeletePatient={handleDeletePatient}
        />
      ),
    },
    {
      label: "Citas",
      component: (
        <AppointmentTable
          appointments={appointments || []}
          role={role}
          token={token}
          refresh={fetchAppointments}
        />
      ),
    },
  ];

  const tabsForDoctor = [
    {
      label: "Perfil",
      component: <DoctorProfile doctorId={doctorId} token={token} />,
    },
    {
      label: "Citas",
      component: (
        <AppointmentTable
          appointments={appointments}
          role={role}
          token={token}
          refresh={fetchAppointments}
        />
      ),
    },
    {
      label: "Horario",
      component: <ScheduleTable schedule={doctorSchedule} />,
    },
  ];

  if (loading) {
    return (
      <Box
        className="loader"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: colors.background,
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
      className="error"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        bgcolor: colors.background,
        p: 2,
      }}>
        <Alert severity="error" sx={{ width: "100%", maxWidth: 600 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
    className="app-container"
    sx={{
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    }}>
      <Box
      className="app-header"
      sx={{
        mb: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <Typography variant="h5" className="rol-text">
          Rol: {role}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, sm: 0 } }}>
          {isAdmin && (
            <>
            <Button
            variant="contained"
            onClick={() => handleDialogOpen("doctor")}
            sx={{
            bgcolor: colors.primary,
            color: colors.buttonText,
            "&:hover": { bgcolor: "#115293" },
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Nuevo Doctor
            </Button>
            <Button
            variant="contained"
            onClick={() => handleDialogOpen("patient")}
            sx={{
            bgcolor: colors.secondary,
            color: colors.buttonText,
            "&:hover": { bgcolor: "#6d1b7b" },
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
              </svg>
              Nuevo Paciente
            </Button>
            </>
          )}
          {(isAdmin || isDoctor) && (
            <Button
            variant="contained"
            onClick={() => handleDialogOpen("appointment")}
            sx={{
            bgcolor: "#388e3c",
            color: colors.buttonText,
            "&:hover": { bgcolor: "#2e7d32" },
            }}>
              <svg xmlns="http://www.w3.org/2000/svg"
              className="button-icon"
              viewBox="0 0 20 20"
              fill="currentColor">
                <path fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd" />
              </svg>
              Nueva Cita
            </Button>
          )}
          <Button
          className="logout-button"
          variant="outlined"
          onClick={onLogout}
          sx={{
            borderColor: colors.danger,
            color: colors.danger,
            "&:hover": {
              borderColor: colors.danger,
              backgroundColor: "#fce4ec",
            },
            ml: 1,
          }}>
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="button-icon"
            viewBox="0 0 20 20"
            fill="currentColor">
              <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
              />
            </svg>
            Cerrar Sesión
            </Button>
          </Stack>
      </Box>
      <Paper sx={{ bgcolor: "#fff" }}>
        <Tabs
        value={tabIndex}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 1,
          "& .MuiTabs-indicator": {
            bgcolor: colors.tabIndicator,
          },
        }}>
          {(isAdmin ? tabsForAdmin : tabsForDoctor).map((tab, index) => (
            <Tab
            key={index}
            label={tab.label}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              fontSize: 18,
              color: colors.blue,
            }}/>
            ))}
            </Tabs>
      <Box sx={{ p: 2 }}>
        {(isAdmin ? tabsForAdmin : tabsForDoctor)[tabIndex]?.component}
      </Box>
      </Paper>

      {}

      <Dialog open={openDialog === "doctor"} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Doctor</DialogTitle>
        <DialogContent>
          <DoctorForm onSave={handleSaveDoctor} role={role} onCancel={handleDialogClose} />
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "patient"} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Paciente</DialogTitle>
        <DialogContent>
          <PatientForm onSaved={handleSavePatient} role={role} onCancel={handleDialogClose} />
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "appointment"} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Cita</DialogTitle>
        <DialogContent>
          <AppointmentForm onSaved={handleSaveAppointment} role={role} currentDoctorId={doctorId} doctors={doctors} patients={patients} token={token} onSave={handleSaveAppointment} onCancel={handleDialogClose} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}