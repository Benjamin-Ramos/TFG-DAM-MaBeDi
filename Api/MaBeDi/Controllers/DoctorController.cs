using Microsoft.AspNetCore.Mvc;
using MaBeDi.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using MaBeDi.Enum;
using System.Globalization;

namespace MaBeDi.Controllers;

[ApiController]
[Route("[Controller]")]
public class DoctorController : Controller
{
    private readonly ApplicationDbContext _context;
    public DoctorController(ApplicationDbContext context)
    {
        _context = context;
    }

    private static readonly Dictionary<DayOfWeek, string> DiasSemana = new()
    {
        { DayOfWeek.Monday, "Monday" },
        { DayOfWeek.Tuesday, "Tuesday" },
        { DayOfWeek.Wednesday, "Wednesday" },
        { DayOfWeek.Thursday, "Thursday" },
        { DayOfWeek.Friday, "Friday" }
    };

    [Authorize(Roles = "Administrator")]
    [HttpGet("doctors")]
    public IActionResult GetDoctors()
    {
        var doctors = _context.Users
            .Where(u => u.Role == Enum.UserRole.Doctor)
            .Include(u => u.DoctorSchedules)
            .ToList()
            .Select(d => new
            {
                d.Id,
                d.Name,
                d.Dni,
                d.PhoneNumber,
                d.Email,
                d.BirthDate,
                Schedules = DiasSemana.Keys.Select(day =>
                {
                    var schedule = d.DoctorSchedules!
                        .FirstOrDefault(s => s.DayOfWeek == day);
                    return new
                    {
                        DayOfWeek = DiasSemana[day],
                        schedule?.EntryTime,
                        schedule?.ExitTime
                    };
                }).ToList()
            })
            .ToList();

        return Ok(doctors);
    }

    [Authorize(Roles = "Administrator, Doctor")]
    [HttpGet("doctors/{id}")]
    public IActionResult GetDoctorById(int id)
    {
        var doctor = _context.Users
            .Where(u => u.Role == Enum.UserRole.Doctor && u.Id == id)
            .Include(u => u.DoctorSchedules)
            .FirstOrDefault();

        if (doctor == null)
            return NotFound();

        var result = new
        {
            doctor.Id,
            doctor.Name,
            doctor.Dni,
            doctor.PhoneNumber,
            doctor.Email,
            doctor.BirthDate,
            Schedules = DiasSemana.Keys.Select(day =>
            {
                var schedule = doctor.DoctorSchedules!
                    .FirstOrDefault(s => s.DayOfWeek == day);
                return new
                {
                    DayOfWeek = DiasSemana[day],
                    schedule?.EntryTime,
                    schedule?.ExitTime
                };
            }).ToList()
        };

        return Ok(result);
    }

    [Authorize(Roles = "Administrator, Doctor")]
    [HttpGet("doctor/{doctorId}/agenda")]
    public async Task<IActionResult> GetDoctorWeeklyAgenda(int doctorId)
    {
        var doctor = await _context.Users
            .Include(u => u.DoctorSchedules)
            .FirstOrDefaultAsync(u => u.Id == doctorId && u.Role == UserRole.Doctor);

        if (doctor == null)
            return NotFound("Doctor no encontrado");

        var startDate = DateTime.Today;
        var endDate = startDate.AddDays(7);

        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Where(a =>
                a.DoctorId == doctorId &&
                a.AppointmentDateTime >= startDate &&
                a.AppointmentDateTime < endDate)
            .ToListAsync();

        var citasPorDia = appointments
            .GroupBy(a => (int)a.AppointmentDateTime.DayOfWeek)
            .ToDictionary(
                g => g.Key,
                g => g.Select(a => new
                {
                    time = a.AppointmentDateTime.ToString("HH:mm"),
                    patient = a.Patient?.Name,
                    status = a.Status
                }).ToList()
            );

        var diasSemana = new[] { "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado" };
        var agenda = new Dictionary<string, object>();

        for (int dia = 1; dia <= 5; dia++)
        {
            var horario = doctor.DoctorSchedules.FirstOrDefault(s => (int)s.DayOfWeek == dia);

            agenda[diasSemana[dia]] = new
            {
                entryTime = horario?.EntryTime?.ToString(@"hh\:mm"),
                exitTime = horario?.ExitTime?.ToString(@"hh\:mm"),
                appointments = citasPorDia.TryGetValue(dia, out var listaCitas)
                ? listaCitas.Cast<object>().ToList()
                : new List<object>()
            };
        }

        return Ok(agenda);
    }

    [Authorize(Roles = "Administrator, Doctor")]
    [HttpPut("update/{id}")]
    public IActionResult UpdateDoctor(int id, [FromBody] UpdateDoctorProfileRequest request)
    {
        var doctor = _context.Users
            .Include(u => u.DoctorSchedules)
            .FirstOrDefault(u => u.Role == UserRole.Doctor && u.Id == id);

        if (doctor == null)
            return NotFound();

        doctor.Name = request.Name;
        doctor.Dni = request.Dni;
        doctor.PhoneNumber = request.PhoneNumber;
        doctor.Email = request.Email;
        doctor.BirthDate = request.BirthDate;

        _context.SaveChanges();

        return NoContent();
    }

    [Authorize(Roles = "Administrator, Doctor")]
    [HttpDelete("doctors/{id}")]
    public IActionResult DeleteDoctor(int id)
    {
        var doctor = _context.Users
            .Include(u => u.DoctorSchedules)
            .FirstOrDefault(u => u.Role == Enum.UserRole.Doctor && u.Id == id);

        if (doctor == null)
            return NotFound();

        if (doctor.DoctorSchedules != null)
            _context.DoctorSchedules.RemoveRange(doctor.DoctorSchedules);

        var citas = _context.Appointments.Where(a => a.DoctorId == doctor.Id).ToList();
        if (citas.Any())
            _context.Appointments.RemoveRange(citas);

        _context.Users.Remove(doctor);
        _context.SaveChanges();

        return NoContent();
    }

    [Authorize(Roles = "Administrator, Doctor")]
    [HttpGet("doctor/{doctorId}/weekly-schedule")]
    public async Task<IActionResult> GetDoctorWeeklyAppointments(int doctorId, [FromQuery] DateTime startDate)
    {
        startDate = DateTime.SpecifyKind(startDate.StartOfWeek(DayOfWeek.Monday), DateTimeKind.Utc);
        var endDate = startDate.AddDays(5);

        var doctor = await _context.Users
            .Include(u => u.DoctorSchedules)
            .FirstOrDefaultAsync(u => u.Id == doctorId && u.Role == UserRole.Doctor);

        if (doctor == null)
            return NotFound("Doctor no encontrado");

        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Where(a => a.DoctorId == doctorId && a.AppointmentDateTime >= startDate && a.AppointmentDateTime < endDate)
            .ToListAsync();

        var culture = new CultureInfo("es-ES");
        var result = new List<object>();

        for (int i = 0; i < 5; i++)
        {
            var currentDate = startDate.AddDays(i);
            var currentDayOfWeek = currentDate.DayOfWeek;

            var schedule = doctor.DoctorSchedules
                .FirstOrDefault(s => s.DayOfWeek == currentDayOfWeek);

            if (schedule == null || schedule.EntryTime == null || schedule.ExitTime == null)
            {
                result.Add(new
                {
                    dayOfWeek = culture.DateTimeFormat.GetDayName(currentDayOfWeek),
                    entryTime = (string?)null,
                    exitTime = (string?)null,
                    appointments = new List<object>()
                });
                continue;
            }

            var dayAppointments = appointments
                .Where(a => a.AppointmentDateTime.Date == currentDate.Date)
                .OrderBy(a => a.AppointmentDateTime)
                .Select(a => new
                {
                    id = a.Id,
                    time = a.AppointmentDateTime.ToString("HH:mm"),
                    patientName = a.Patient != null ? a.Patient.Name : "Sin nombre"
                })
                .ToList();

            result.Add(new
            {
                dayOfWeek = culture.DateTimeFormat.GetDayName(currentDayOfWeek),
                entryTime = schedule.EntryTime.Value.ToString(@"hh\:mm"),
                exitTime = schedule.ExitTime.Value.ToString(@"hh\:mm"),
                appointments = dayAppointments
            });
        }

        return Ok(result);
    }
}
public static class DateTimeExtensions
{
    public static DateTime StartOfWeek(this DateTime dt, DayOfWeek startOfWeek)
    {
        int diff = (7 + (dt.DayOfWeek - startOfWeek)) % 7;
        return dt.AddDays(-diff).Date;
    }
}