import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import logoBase64 from "../../../public/logoBase64.js";
import "../../styles/TableStyles.css";

const statusOptions = ["Programada", "Completada", "Cancelada"];

export default function AppointmentTable({
  appointments = [],
  role,
  refresh,
  token,
  loggedDoctorName,
}) {
  const [editingId, setEditingId] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});

  const showDoctorColumn = role !== "Doctor";
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const handleStatusChange = (id, newStatus) => {
    setStatusUpdates((prev) => ({ ...prev, [id]: newStatus }));
  };

  const saveStatus = async (appt) => {
    const updatedStatus = statusUpdates[appt.id] || appt.status;
    try {
      await axios.put(
        `https://tfg-dam-mabedi.onrender.com/Appointment/update/${appt.id}`,
        { status: updatedStatus },
        config
      );
      setEditingId(null);
      refresh?.();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar estado");
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("¿Eliminar esta cita?")) return;
    try {
      await axios.delete(`https://tfg-dam-mabedi.onrender.com/Appointment/delete/${id}`, config);
      refresh?.();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar cita");
    }
  };

  const generatePDF = (appt) => {
    const doc = new jsPDF();
    const dateTime = appt.appointmentDateTime || "";
    const [date, time] = dateTime.split("T");
    
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 15, 10, 25, 25);
    }
    doc.setFontSize(16).setFont("helvetica", "bold").text("Centro Médico MABEDI", 105, 20, { align: "center" });
    doc.setFontSize(10).text("Informe de cita médica", 105, 26, { align: "center" });
    doc.setLineWidth(0.5).line(20, 30, 190, 30);
    
    const fields = [];
    if (role === "Doctor" && loggedDoctorName) {
      fields.push({ label: "Doctor (logueado):", value: loggedDoctorName });
    }
    fields.push(
      { label: "Nombre paciente:", value: appt.patient?.name || "N/A" },
      { label: "DNI paciente:", value: appt.patient?.dni || "N/A" }
    );
    if (showDoctorColumn && appt.doctor?.name) {
      fields.push({ label: "Nombre doctor:", value: appt.doctor.name });
    }
    fields.push(
      { label: "Fecha cita:", value: date },
      { label: "Hora cita:", value: time?.slice(0,5) },
      { label: "Estado:", value: appt.status }
    );

    let y = 40;
    const spacing = 8;
    fields.forEach(f => {
      doc.setFont("helvetica", "bold").text(f.label, 25, y);
      doc.setFont("helvetica", "normal").text(f.value, 90, y);
      y += spacing;
    });

    doc.setFontSize(9).setTextColor(120)
      .text("Documento confidencial generado por MABEDI.", 105, doc.internal.pageSize.height - 20, { align: "center" });
    
    doc.save(`Cita_${appt.id}.pdf`);
  };

  return (
    <div className="table-wrapper">
      <table className="table" aria-label="Tabla de citas">
        <thead>
          <tr>
            <th>DNI</th>
            {showDoctorColumn && <th>Doctor</th>}
            <th>Paciente</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(appointments) && appointments.length > 0 ? (
            appointments.map(appt => {
              const dt = appt.appointmentDateTime || "";
              const [date, time] = dt.split("T");
              const timeShort = time?.slice(0,5) || "";

              return (
                <tr key={appt.id}>
                  <td>{appt.patient?.dni || `ID:${appt.patient?.id}`}</td>
                  {showDoctorColumn && <td>{appt.doctor?.name || "N/A"}</td>}
                  <td>{appt.patient?.name || "N/A"}</td>
                  <td>{date}</td>
                  <td>{timeShort}</td>
                  <td>
                    {editingId === appt.id ? (
                      <select value={statusUpdates[appt.id] || appt.status}
                              onChange={(e) => handleStatusChange(appt.id, e.target.value)}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span onClick={() => setEditingId(appt.id)} style={{ cursor: "pointer" }}>
                        {appt.status}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === appt.id ? (
                      <button
                        className="btn-action btn-save"
                        onClick={() => saveStatus(appt)}>Guardar</button>
                    ) : (
                      <>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => deleteAppointment(appt.id)}
                      >
                        Eliminar
                      </button>
                      <button
                        className="btn-action btn-print"
                        onClick={() => generatePDF(appt)}
                      >
                        Imprimir
                      </button>
                    </>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={showDoctorColumn ? 7 : 6} style={{ textAlign: "center" }}>
                No hay citas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}