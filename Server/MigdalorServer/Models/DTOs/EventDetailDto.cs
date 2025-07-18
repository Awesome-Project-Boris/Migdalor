namespace MigdalorServer.Models.DTOs
{
    public class EventDetailDto : EventBaseDto
    {
        public HostDto Host { get; set; }
        public int ParticipantsCount { get; set; }
    }
}
