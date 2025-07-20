namespace MigdalorServer.Models.DTOs
{
    public class HostDto
    {
        public Guid? HostId { get; set; }
        public string EnglishName { get; set; }
        public string HebrewName { get; set; }
        public string Role { get; set; }
    }
}
