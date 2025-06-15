import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import "../../styles/TableStyles.css";

export default function DoctorTable({ doctors, onUpdateDoctor, onDeleteDoctor }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editedData, setEditedData] = useState({});

  const doctorArray = doctors && Array.isArray(doctors.$values) ? doctors.$values : doctors || [];

  const handleRowClick = (doctor) => {
    setSelectedDoctor(doctor);
    setEditedData({ ...doctor });
  };

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro que quieres eliminar este doctor?")) {
      onDeleteDoctor(selectedDoctor.id);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedDoctor(null);
    setEditedData({});
  };

  const handleSave = () => {
    onUpdateDoctor(editedData);
    handleClose();
  };

  return (
    <>
      <div className="table-wrapper">
        <table className="table" aria-label="Tabla de doctores">
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
            {doctorArray.length > 0 ? (
              doctorArray.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => handleRowClick(doc)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{doc.name}</td>
                  <td>{doc.email}</td>
                  <td>{doc.dni}</td>
                  <td>{doc.phoneNumber}</td>
                  <td>{doc.birthDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay doctores</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedDoctor} onClose={handleClose}>
        <DialogTitle>Editar Doctor</DialogTitle>
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