namespace MaBeDi.DTOs
{
    public class RegisterAppointmentDniRequest
    {
        public int DoctorId { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public string Status { get; set; }
    }
}
