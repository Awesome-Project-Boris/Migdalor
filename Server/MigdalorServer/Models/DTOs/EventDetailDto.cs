namespace MigdalorServer.Models.DTOs
{
    public class EventDetailDto : EventDto
    {
        public HostDto Host { get; set; }
        public string RecurrenceRule { get; set; }
    }
}
