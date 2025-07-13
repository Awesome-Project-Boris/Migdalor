namespace MigdalorServer.Models.DTOs
{
    public class TimetableEntryDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string SourceTable { get; set; } // "OH_Events", "OH_EventInstances", or "OH_TimeTableAdditions"

        public int? NavigationEventId { get; set; }
    }
}
