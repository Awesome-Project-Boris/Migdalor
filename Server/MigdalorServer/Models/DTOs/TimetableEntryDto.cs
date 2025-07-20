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
        public string SourceTable { get; set; }

        public int? NavigationEventId { get; set; }

        /// <summary>
        /// The status of the event instance (e.g., 'Scheduled', 'Cancelled', 'Postponed').
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// Optional notes, for example, to explain a cancellation or rescheduling.
        /// </summary>
        public string Notes { get; set; }
    
}
}
