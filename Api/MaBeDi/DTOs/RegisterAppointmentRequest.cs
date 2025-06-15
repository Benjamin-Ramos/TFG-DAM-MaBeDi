namespace MaBeDi.DTOs
{
    public class RegisterAppointmentRequest
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public string Status { get; set; }
    }
}
