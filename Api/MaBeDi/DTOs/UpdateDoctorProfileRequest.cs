public class UpdateDoctorProfileRequest
{
    public string Name { get; set; }
    public string Dni { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
    public DateOnly BirthDate { get; set; }
}