namespace MigdalorServer.Models.DTOs
{
    public class RegisterForEventDto
    {
        public int EventId { get; set; }
        public Guid ParticipantId { get; set; }
    }
}
