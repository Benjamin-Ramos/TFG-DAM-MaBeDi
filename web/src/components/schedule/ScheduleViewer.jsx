import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { useState } from "react";
import "../../styles/ScheduleViewer.css"

const daysOfWeek = ["lunes", "martes", "miércoles", "jueves", "viernes"];

function generateTimeSlots(start, end) {
  const slots = [];
  let [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  while (
    startHour < endHour ||
    (startHour === endHour && startMinute < endMinute)
  ) {
    const hour = startHour.toString().padStart(2, "0");
    const minute = startMinute.toString().padStart(2, "0");
    slots.push(`${hour}:${minute}`);
    startMinute += 30;
    if (startMinute >= 60) {
      startHour += 1;
      startMinute = 0;
    }
  }
  return slots;
}

export default function ScheduleViewer({ schedules = [] }) {
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleOpen = (appointment) => {
    setSelectedAppointment(appointment);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAppointment(null);
  };

  const timeSlots = generateTimeSlots("08:00", "23:30");

  const getAppointment = (day, time) => {
    if (!Array.isArray(schedules)) return null;
    const scheduleForDay = schedules.find((s) => s.dayOfWeek === day);
    return scheduleForDay?.appointments.find((a) => a.time === time);
  };

  return (
    <Box className="schedule-container">
      <Typography variant="h6" gutterBottom>
        Horario semanal
      </Typography>
      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="time-column">Hora</TableCell>
              {daysOfWeek.map((day) => (
                <TableCell key={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map((time) => (
              <TableRow key={time}>
                <TableCell className="time-column">{time}</TableCell>
                {daysOfWeek.map((day) => {
                  const appointment = getAppointment(day, time);
                  return (
                    <TableCell key={day + time}>
                      {appointment ? (
                        <Button onClick={() => handleOpen(appointment)}>
                          {appointment.patientName}
                        </Button>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Detalles de la cita</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Typography>
              Paciente: {selectedAppointment.patientName}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}