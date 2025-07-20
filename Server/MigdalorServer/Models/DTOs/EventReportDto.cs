using System;

namespace MigdalorServer.Models.DTOs
{
    public class EventReportDto
    {
        public int EventId { get; set; }
        public string EventName { get; set; }
        public DateTime EventDate { get; set; }
        public int ParticipantCount { get; set; }
    }
}
