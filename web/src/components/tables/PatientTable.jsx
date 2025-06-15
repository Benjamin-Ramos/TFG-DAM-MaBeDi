import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import "../../styles/TableStyles.css";

export default function PatientTable({ patients, onUpdatePatient, onDeletePatient }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editedData, setEditedData] = useState({});

  const patientsArray = patients && Array.isArray(patients.$values) ? patients.$values : patients || [];

  const handleRowClick = (patient) => {
    setSelectedPatient(patient);
    setEditedData({ ...patient });
  };

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro que quieres eliminar este paciente?")) {
      onDeletePatient(selectedPatient.id);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedPatient(null);
    setEditedData({});
  };

  const handleSave = () => {
    onUpdatePatient(editedData);
    handleClose();
  };

  return (
    <>
      <div className="table-wrapper">
        <table className="table" aria-label="Tabla de pacientes">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Fecha de Nacimiento</th>
            </tr>
          </thead>
          <tbody>
            {patientsArray.length === 0 ? (
              <tr><td colSpan="5">No hay pacientes</td></tr>
            ) : (
              patientsArray.map((pat) => (
                <tr key={pat.id} onClick={() => handleRowClick(pat)} style={{ cursor: "pointer" }}>
                  <td>{pat.name}</td>
                  <td>{pat.email}</td>
                  <td>{pat.dni}</td>
                  <td>{pat.phoneNumber}</td>
                  <td>{pat.birthDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedPatient} onClose={handleClose}>
        <DialogTitle>Editar Paciente</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            name="name"
            value={editedData.name || ""}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={editedData.email || ""}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="DNI"
            name="dni"
            value={editedData.dni || ""}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Teléfono"
            name="phoneNumber"
            value={editedData.phoneNumber || ""}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Fecha de Nacimiento"
            name="birthDate"
            type="date"
            value={editedData.birthDate || ""}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button color="error" onClick={handleDelete}>
            Eliminar
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}