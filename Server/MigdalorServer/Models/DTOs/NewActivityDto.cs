using System;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models.DTOs
{
    public class NewActivityDto
    {
        [Required]
        [StringLength(100)]
        public string EventName { get; set; }

        public string? Description { get; set; }

        [Required]
        public Guid HostId { get; set; }

        public string? Location { get; set; }

        public int? PictureId { get; set; }

        public int? Capacity { get; set; }

        public bool IsRecurring { get; set; } = false;
        public string? RecurrenceRule { get; set; } = null;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
    }
}