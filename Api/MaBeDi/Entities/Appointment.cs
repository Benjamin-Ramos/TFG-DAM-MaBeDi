namespace MaBeDi.Entities
{
    public class Appointment
    {
        public int Id { get; set; }

        public int DoctorId { get; set; }
        public User Doctor { get; set; } = null!;

        public int PatientId { get; set; }
        public User Patient { get; set; } = null!;

        public string Status { get; set; } = null!;
        public DateTime AppointmentDateTime { get; set; }
    }
}