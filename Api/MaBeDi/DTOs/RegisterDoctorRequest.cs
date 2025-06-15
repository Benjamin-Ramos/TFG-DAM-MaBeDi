using MaBeDi.Entities;

namespace MaBeDi.DTOs
{
    public class RegisterDoctorRequest
    {
        public required string Username { get; set; }
        public required string Password { get; set; }

        public required string Name { get; set; }
        public required string Dni { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Email { get; set; }
        public required DateOnly BirthDate { get; set; }

        public List<ScheduleRequest>? Schedules { get; set; }

        public class ScheduleRequest
        {
            public DayOfWeek DayOfWeek { get; set; }
            public TimeSpan EntryTime { get; set; }
            public TimeSpan ExitTime { get; set; }
        }
    }
}
