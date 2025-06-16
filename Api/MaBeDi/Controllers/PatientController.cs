using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MaBeDi.Persistence;
using MaBeDi.DTOs;
using System.Numerics;

namespace MaBeDi.Controllers;

[ApiController]
[Route("[controller]")]
public class PatientController : Controller
{
    private readonly ApplicationDbContext _context;
    public PatientController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize( Roles = "Doctor, Administrator")]
    [HttpGet("patients")]
    public IActionResult GetPatients()
    {
        var patients = _context.Users
            .Where(u => u.Role == Enum.UserRole.Patient)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Dni,
                p.PhoneNumber,
                p.Email,
                p.BirthDate
            })
            .ToList();
        return Ok(patients);
    }

    [Authorize(Roles = "Doctor, Administrator, Patient")]
    [HttpGet("patients/{id}")]
    public IActionResult GetPatient(int id)
    {
        var patient = _context.Users
            .Where(u => u.Role == Enum.UserRole.Patient && u.Id == id)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Dni,
                p.PhoneNumber,
                p.Email,
                p.BirthDate
            })
            .FirstOrDefault();
        if (patient == null)
            return NotFound("Patient not found");
        return Ok(patient);
    }

    [Authorize(Roles = "Administrator")]
    [HttpPut("update/{id}")]
    public IActionResult UpdatePatient(int id, [FromBody] UpdatePatientRequest request)
    {
        var patient = _context.Users.Find(id);
        if (patient == null)
            return NotFound("Patient not found");
        patient.Name = request.Name;
        patient.Dni = request.Dni;
        patient.PhoneNumber = request.PhoneNumber;
        patient.Email = request.Email;
        patient.BirthDate = request.BirthDate;
        _context.SaveChanges();
        return Ok("Patient updated");
    }

    [Authorize(Roles = "Administrator")]
    [HttpDelete("delete/{id}")]
    public IActionResult DeletePatient(int id)
    {
        var patient = _context.Users.Find(id);
        if (patient == null)
            return NotFound("Patient not found");

        if (patient.DoctorSchedules != null)
            _context.DoctorSchedules.RemoveRange(patient.DoctorSchedules);

        var citas = _context.Appointments.Where(a => a.PatientId == patient.Id).ToList();
        if (citas.Any())
            _context.Appointments.RemoveRange(citas);

        _context.Users.Remove(patient);
        _context.SaveChanges();
        return Ok("Patient deleted");
    }
}