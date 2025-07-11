namespace MigdalorServer.Models.DTOs
{
    public class ParticipantDto
    {
        public Guid ParticipantId { get; set; }
        public string EnglishFullName { get; set; }
        public string HebrewFullName { get; set; }
        public string RegistrationStatus { get; set; }
    }
}
