using Microsoft.Build.Framework;

namespace MigdalorServer.Models.DTOs
{
    public class UserLogin
    {
        [Required]
        public string PhoneNumber { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }
}
