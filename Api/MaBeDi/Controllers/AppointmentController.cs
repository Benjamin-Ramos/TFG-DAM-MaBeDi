using MaBeDi.DTOs;
using MaBeDi.Entities;
using MaBeDi.Enum;
using MaBeDi.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MaBeDi.Controllers;

[ApiController]
[Route("[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AppointmentController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Administrator, Doctor")]
    [HttpPost("appointments/register")]
    public async Task<IActionResult> RegisterAppointment(RegisterAppointmentRequest request)
    {
        var doctor = await _context.Users.Include(u => u.DoctorSchedules)
                        .FirstOrDefaultAsync(u => u.Id == request.DoctorId && u.Role == UserRole.Doctor);
        if (doctor == null)
            return NotFound("Doctor not found");

        var patient = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.PatientId && u.Role == UserRole.Patient);
        if (patient == null)
            return NotFound("Patient not found");

        var time = request.AppointmentDateTime.TimeOfDay;
        if (time.Minutes != 0 && time.Minutes != 30)
            return BadRequest("Las citas solo pueden programarse a las hh:00 o hh:30.");

        var appointmentDay = request.AppointmentDateTime.DayOfWeek;
        var schedule = doctor.DoctorSchedules?
            .FirstOrDefault(s => s.DayOfWeek == appointmentDay &&
                                 s.EntryTime.HasValue && s.ExitTime.HasValue &&
                                 time >= s.EntryTime.Value &&
                                 time < s.ExitTime.Value);

        if (schedule == null)
            return BadRequest("La cita no está dentro del horario laboral del doctor.");

        var overlapping = await _context.Appointments.AnyAsync(a =>
            a.DoctorId == doctor.Id &&
            a.AppointmentDateTime == request.AppointmentDateTime);

        if (overlapping)
            return Conflict("Ya existe una cita para este doctor en esa franja horaria.");

        var appointment = new Appointment
        {
            DoctorId = doctor.Id,
            PatientId = patient.Id,
            Status = request.Status,
            AppointmentDateTime = request.AppointmentDateTime
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        return Ok(appointment);
    }


    [Authorize(Roles = "Administrator, Doctor")]
    [HttpPost("patient/{dni}")]
    public async Task<IActionResult> CreateAppointmentForPatient(string dni, [FromBody] AppointmentDTO dto)
    {
        try
        {
            var patient = await _context.Users.FirstOrDefaultAsync(p => p.Dni == dni);
            if (patient == null)
                return NotFound("Paciente no encontrado");

            var doctor = await _context.Users.Include(u => u.DoctorSchedules)
                             .FirstOrDefaultAsync(u => u.Id == dto.DoctorId && u.Role == UserRole.Doctor);
            if (doctor == null)
                return NotFound("Doctor no encontrado");

            var time = dto.AppointmentDateTime.TimeOfDay;
            if (time.Minutes != 0 && time.Minutes != 30)
                return BadRequest("Las citas solo pueden programarse a las hh:00 o hh:30.");

            var overlapping = await _context.Appointments.AnyAsync(a =>
                a.DoctorId == doctor.Id &&
                a.AppointmentDateTime == dto.AppointmentDateTime);

            if (overlapping)
                return Conflict("Ya existe una cita para este doctor en esa franja horaria.");

            var appointment = new Appointment
            {
                DoctorId = doctor.Id,
                PatientId = patient.Id,
                AppointmentDateTime = dto.AppointmentDateTime,
                Status = dto.Status
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return Ok(appointment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error interno: {ex.Message}");
        }
    }

    [Authorize(Roles = "Administrator, Doctor")]
    [HttpGet("appointments")]
    public IActionResult GetAppointments()
    {
        var appointments = _context.Appointments
            .Include(a => a.Doctor)
            .Include(a => a.Patient)
            .Select(a => new
            {
                a.Id,
                a.Status,
                a.AppointmentDateTime,
                Doctor = new
                {
                    a.Doctor.Id,
                    a.Doctor.Name,
                    a.Doctor.Dni
                },
                Patient = new
                {
                    a.Patient.Id,
                    a.Patient.Name,
                    a.Patient.Dni   
                }
            })
            .ToList();

        return Ok(appointments);
    }

    [Authorize(Roles = ("Administrator, Doctor, Patient"))]
    [HttpGet("appointments/patient/{patientId}")]
    public IActionResult GetPatientAppointments(int patientId)
    {
        var appointments = _context.Appointments
            .Where(a => a.PatientId == patientId)
            .Include(a => a.Doctor)
            .Select(a => new
            {
                a.Id,
                a.Status,
                a.AppointmentDateTime,
                Doctor = new
                {
                    a.Doctor.Id,
                    a.Doctor.Name
                }
            })
            .ToList();
        return Ok(appointments);
    }

    [Authorize(Roles = "Administrator, Doctor")]
    [HttpGet("appointments/doctor/{doctorId}")]
    public IActionResult GetDoctorAppointments(int doctorId)
    {
        var doctorExists = _context.Users.Any(d => d.Id == doctorId);
        if (!doctorExists)
            return NotFound($"Doctor con Id {doctorId} no encontrado.");

        var appointments = _context.Appointments
            .Where(a => a.DoctorId == doctorId)
            .Include(a => a.Patient)
            .OrderBy(a => a.AppointmentDateTime)
            .Select(a => new
            {
                id = a.Id,
                status = a.Status,
                appointmentDateTime = a.AppointmentDateTime,
                patient = new
                {
                    id = a.Patient.Id,
                    name = a.Patient.Name,
                    username = a.Patient.Username,
                    dni = a.Patient.Dni
                }
            })
            .ToList();

        return Ok(appointments);
    }

    [Authorize(Roles = "Administrator, Doctor")]
    [HttpPut("update/{id}")]
    public IActionResult UpdateAppointmentStatus(int id, UpdateAppointmentRequest request)
    {
        var appointment = _context.Appointments.Find(id);
        if (appointment == null)
            return NotFound("Appointment not found");
        appointment.Status = request.Status;
        _context.Appointments.Update(appointment);
        _context.SaveChanges();
        return Ok("Appointment status updated");
    }

    [Authorize(Roles = "Administrator, Doctor")]
    [HttpDelete("delete/{id}")]
    public IActionResult DeleteAppointment(int id)
    {
        var appointment = _context.Appointments.Find(id);
        if (appointment == null)
            return NotFound("Appointment not found");
        _context.Appointments.Remove(appointment);
        _context.SaveChanges();
        return Ok("Appointment deleted");
    }
}