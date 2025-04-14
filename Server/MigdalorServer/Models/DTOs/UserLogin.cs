using Microsoft.Build.Framework;

namespace MigdalorServer.Models.DTOs
{
    public class UserLogin
    {
        public UserLogin(string phoneNumber, string password)
        {
            PhoneNumber = phoneNumber;
            Password = password;
        }

        [Required]
        public string PhoneNumber { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }
}
