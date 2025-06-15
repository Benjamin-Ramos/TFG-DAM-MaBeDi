using System.Text.Json.Serialization;

namespace MaBeDi.Entities
{
    public class Schedule
    {
        public int Id { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan? EntryTime { get; set; }
        public TimeSpan? ExitTime { get; set; }
        public int UserId { get; set; }
        [JsonIgnore]
        public User? Doctor { get; set; }
    }
}