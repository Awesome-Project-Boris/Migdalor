namespace MigdalorServer.Models.DTOs
{
    public class ResidentDigest
    {

        public Guid UserId { get; set; } 

        public string? HebFirstName { get; set; } 

        public string? HebLastName { get; set; } 

        public string? EngFirstName { get; set; } 

        public string? EngLastName { get; set; }

        public string? PhotoUrl { get; set; }
    }
}

