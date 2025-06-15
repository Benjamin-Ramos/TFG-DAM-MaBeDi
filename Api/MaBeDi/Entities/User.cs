
using MaBeDi.Enum;

namespace MaBeDi.Entities
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string PasswordHash { get; set; }

        public UserRole Role { get; set; }

        public string? Name { get; set; }
        public string? Dni { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public DateOnly? BirthDate { get; set; }

        public ICollection<Schedule>? DoctorSchedules { get; set; }

        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpires { get; set; }

        public string? PendingEmail { get; set; }
        public string? EmailChangeToken { get; set; }
        public DateTime? EmailChangeTokenExpires { get; set; }
    }
}
