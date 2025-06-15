using MaBeDi.DTOs;
using MaBeDi.Entities;
using MaBeDi.Enum;
using MaBeDi.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace MaBeDi.Controllers;

[ApiController]
[Route("[Controller]")]
public class AdministratorController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AdministratorController(ApplicationDbContext context, IPasswordHasher<User> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    [Authorize(Roles = "Administrator")]
    [HttpPut("update/{id}")]
    public IActionResult UpdateOtherAdmin(int id, [FromBody] UpdateAdminCredentialsRequest request)
    {
        var admin = _context.Users
            .FirstOrDefault(u => u.Id == id && u.Role == UserRole.Administrator);
        if (admin == null)
            return NotFound("Administrator not found");

        admin.Username = request.Username;
        admin.PasswordHash = _passwordHasher.HashPassword(admin, request.NewPassword);

        _context.SaveChanges();

        return Ok("Admin updated");
    }

    [Authorize(Roles = "Administrator")]
    [HttpDelete("delete/{id}")]
    public IActionResult DeleteOtherAdmin(int id)
    {
        var admin = _context.Users
            .FirstOrDefault(u => u.Id == id && u.Role == UserRole.Administrator);
        if (admin == null)
            return NotFound("Administrator not found");
        _context.Users.Remove(admin);
        _context.SaveChanges();
        return Ok("Admin deleted");
    }
}
