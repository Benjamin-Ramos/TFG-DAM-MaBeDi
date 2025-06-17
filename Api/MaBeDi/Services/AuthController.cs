using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using MaBeDi.DTOs;
using MaBeDi.Entities;
using MaBeDi.Persistence;
using MaBeDi.Enum;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace MaBeDi.Services;

[ApiController]
[Route("/")]
public class RootController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("MABEDI API está funcionando correctamente.");
    }
}

[Route("auth")]
public class AuthController : ControllerBase
{

    private readonly ApplicationDbContext _context;
    private readonly JwtTokenGenerator _jwtTokenGenerator;
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly EmailService _emailService;
    private readonly AppSettings _appSettings;

    public AuthController(ApplicationDbContext context, IConfiguration configuration, JwtTokenGenerator jwtTokenGenerator, IPasswordHasher<User> passwordHasher, EmailService emailService, AppSettings appSettings)
    {
        _context = context;
        _configuration = configuration;
        _jwtTokenGenerator = jwtTokenGenerator;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
        _appSettings = appSettings;
    }

    [Authorize(Roles = "Administrator")]
    [HttpGet("users")]
    public IActionResult GetAllUsers()
    {
        var users = _context.Users
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.PasswordHash,
                u.Name,
                u.Dni,
                u.PhoneNumber,
                u.Email,
                u.BirthDate,
                Role = u.Role.ToString()
            })
            .ToList();
        return Ok(users);
    }

    [Authorize(Roles = "Administrator")]
    [HttpPost("register/doctor")]
    public async Task<IActionResult> RegisterDoctor([FromBody] RegisterDoctorRequest request)
    {
        if (_context.Users.Any(u => u.Username == request.Username))
            return BadRequest("Username already exists");

        var user = new User
        {
            Username = request.Username,
            PasswordHash = _passwordHasher.HashPassword(null!, request.Password),
            Role = UserRole.Doctor,
            Name = request.Name,
            Dni = request.Dni,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email,
            BirthDate = request.BirthDate,
            DoctorSchedules = request.Schedules?.Select(s => new Schedule
            {
                DayOfWeek = s.DayOfWeek,
                EntryTime = s.EntryTime,
                ExitTime = s.ExitTime
            }).ToList()

        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Doctor registered");
    }

    [Authorize(Roles = "Administrator")]
    [HttpPost("register/patient")]
    public async Task<IActionResult> RegisterPatient([FromBody] RegisterPatientRequest request)
    {
        if (_context.Users.Any(u => u.Username == request.Username))
            return BadRequest("Username already exists");

        var user = new User
        {
            Username = request.Username,
            PasswordHash = _passwordHasher.HashPassword(null!, request.Password),
            Role = UserRole.Patient,
            Name = request.Name,
            Dni = request.Dni,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email,
            BirthDate = request.BirthDate
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Patient registered");
    }

    [HttpPost("register/admin")]
    public async Task<IActionResult> RegisterAdmin(RegisterAdminRequest request)
    {
        if (_context.Users.Any(u => u.Username == request.Username))
            return BadRequest("Username already exists");

        var user = new User
        {
            Username = request.Username,
            PasswordHash = _passwordHasher.HashPassword(null!, request.Password),
            Role = UserRole.Administrator
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Administrator registered");
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest("Username and password are required.");
        }

        var identifier = request.Username;
        var user = _context.Users
            .FirstOrDefault(u => u.Username == identifier || u.Email == identifier);

        if (user == null)
        {
            return Unauthorized("Invalid credentials.");
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Invalid credentials.");
        }

        if (user.Role == UserRole.Patient)
        {
            return Unauthorized("Patients can´t log in.");
        }

        var token = _jwtTokenGenerator.GenerateJwtToken(user);

        Response.Headers.Append("X-Role", user.Role.ToString());

        return Ok(new
        {
            Token = token,
            Role = user.Role.ToString()
        });
    }

    [HttpPost("login/patient")]
    public IActionResult LoginPaciente([FromBody] LoginRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest("Username and password are required.");
        }

        var identifier = request.Username;
        var user = _context.Users
            .FirstOrDefault(u => u.Username == identifier || u.Email == identifier);

        if (user == null)
        {
            return Unauthorized("Invalid credentials.");
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Invalid credentials.");
        }

        if (user.Role != UserRole.Patient)
        {
            return Unauthorized("Only patients can log in.");
        }

        var token = _jwtTokenGenerator.GenerateJwtToken(user);

        Response.Headers.Append("X-Role", user.Role.ToString());

        return Ok(new
        {
            Token = token,
            Role = user.Role.ToString()
        });
    }

    [Authorize(Roles = "Patient, Doctor, Administrator")]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var username = User.Identity?.Name;
        if (username == null) return Unauthorized();

        var user = _context.Users.FirstOrDefault(u => u.Username == username);
        if (user == null) return Unauthorized();

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
        if (result == PasswordVerificationResult.Failed)
            return BadRequest("Contraseña actual incorrecta");

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok("Contraseña actualizada correctamente");
    }

    [Authorize(Roles = "Patient,Doctor")]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
        if (user == null) return BadRequest("Usuario no encontrado");

        if (user.ResetToken != request.Token || user.ResetTokenExpires < DateTime.UtcNow)
            return BadRequest("Token inválido o expirado");

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        user.ResetToken = null;
        await _context.SaveChangesAsync();

        return Ok("Contraseña restablecida correctamente");
    }

    [Authorize(Roles = "Patient,Doctor")]
    [HttpPost("reset-password-request")]
    public async Task<IActionResult> ResetPasswordRequest([FromBody] ResetPasswordEmailRequest request)
    {
        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
        if (user == null)
            return BadRequest("Usuario no encontrado");

        var token = Guid.NewGuid().ToString();
        user.ResetToken = token;
        user.ResetTokenExpires = DateTime.UtcNow.AddHours(1);

        await _context.SaveChangesAsync();

        var resetLink = $"{_appSettings.FrontendBaseUrl}/reset-password?token={token}";

        var htmlMessage = $"<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p><p><a href='{resetLink}'>Restablecer contraseña</a></p>";

        await _emailService.SendEmailAsync(user.Email, "Restablecer contraseña", htmlMessage);

        return Ok("Se ha enviado un correo para restablecer la contraseña.");
    }

    [AllowAnonymous]
    [HttpPost("request-email-change")]
    public async Task<IActionResult> RequestEmailChange([FromBody] ChangeEmailRequest request)
    {
        foreach (var claim in User.Claims)
        {
            Console.WriteLine($"{claim.Type}: {claim.Value}");
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(userId);
        
        if (user == null)
            return Unauthorized("Usuario no encontrado");

        var token = Guid.NewGuid().ToString();
        user.PendingEmail = request.NewEmail;
        user.EmailChangeToken = token;
        user.EmailChangeTokenExpires = DateTime.UtcNow.AddMinutes(5);

        await _context.SaveChangesAsync();

        var confirmationLink = $"{_appSettings.FrontendBaseUrl}/confirm-email-change?token={token}";
        var htmlMessage = $"<p>Confirma tu nuevo correo haciendo clic en el siguiente enlace:</p><p><a href='{confirmationLink}'>Confirmar cambio de correo</a></p>";

        try
        {
            await _emailService.SendEmailAsync(request.NewEmail, "Confirma tu cambio de correo", htmlMessage);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error enviando correo: {ex.Message}");
            return StatusCode(500, "No se pudo enviar el correo.");
        }

        return Ok("Se ha enviado un enlace de confirmación al nuevo correo.");
    }

    [AllowAnonymous]
    [HttpGet("confirm-email-change")]
    public async Task<IActionResult> ConfirmEmailChange([FromQuery] string token)
    {
        var user = _context.Users.FirstOrDefault(u =>
            u.EmailChangeToken == token && u.EmailChangeTokenExpires > DateTime.UtcNow);

        if (user == null)
            return BadRequest("Token inválido o expirado");

        user.Email = user.PendingEmail;
        user.PendingEmail = null;
        user.EmailChangeToken = null;
        user.EmailChangeTokenExpires = null;

        await _context.SaveChangesAsync();

        return Ok("Correo electrónico actualizado correctamente.");
    }
    [HttpGet("test-email")]
    public async Task<IActionResult> TestEmail()
    {
        await _emailService.SendEmailAsync("benjaramossmr@gmail.com", "Correo de prueba", "<p>Funciona</p>");
        return Ok("Correo enviado");
    }

}