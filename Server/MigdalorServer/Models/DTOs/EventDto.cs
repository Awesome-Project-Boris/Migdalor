namespace MigdalorServer.Models.DTOs
{
    public class EventDto
    {
        public int EventId { get; set; }
        public string EventName { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public bool IsRecurring { get; set; }
        public int? PictureId { get; set; }
        public string? PicturePath { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? Capacity { get; set; }

        public int ParticipantsCount { get; set; }
    }
}
