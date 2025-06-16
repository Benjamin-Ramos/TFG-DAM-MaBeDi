namespace MaBeDi.DTOs
{
    public class RegisterPatientRequest
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Name { get; set; }
        public required string Dni { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Email { get; set; }
        public required DateOnly BirthDate { get; set; }
    }

}
