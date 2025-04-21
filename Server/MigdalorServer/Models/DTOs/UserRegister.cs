namespace MigdalorServer.Models.DTOs
{
    public class UserRegister
    {
        public string PhoneNumber { get; set; } = null!;
        public string HebFirstName { get; set; } = null!;
        public string HebLastName { get; set; } = null!;
        public string EngFirstName { get; set; } = null!;
        public string EngLastName { get; set; } = null!;
        public string Gender { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
