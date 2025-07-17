using System;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models.DTOs
{
    public class CreateEventDto
    {
        [Required]
        public string EventName { get; set; }
        public string Description { get; set; }
        public Guid HostID { get; set; }
        public string Location { get; set; }
        public int? Capacity { get; set; }
        public bool IsRecurring { get; set; }
        public string RecurrenceRule { get; set; }

        [Required]
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
