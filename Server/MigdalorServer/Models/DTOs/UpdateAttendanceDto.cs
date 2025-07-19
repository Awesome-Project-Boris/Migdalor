namespace MigdalorServer.Models.DTOs
{
    public class UpdateParticipationDto
    {
        public int EventId { get; set; }
        public Guid ParticipantId { get; set; }
        public string Status { get; set; }
    }
}
