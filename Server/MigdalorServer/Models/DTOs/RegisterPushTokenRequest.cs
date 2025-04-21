using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models.DTOs
{
    public class RegisterPushTokenRequest
    {
        [Required]
        public Guid PersonId { get; set; }

        [Required]
        [MaxLength(100)]
        public string PushToken { get; set; } = null!;
    }
}
