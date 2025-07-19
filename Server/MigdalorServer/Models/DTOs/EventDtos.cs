using System;
using System.Collections.Generic;

namespace MigdalorServer.Models.DTOs
{
    // DTO for creating a new event from the admin panel
    public class AdminCreateEventDto
    {
        public string EventName { get; set; }
        public string Description { get; set; }
        public Guid? HostId { get; set; }
        public string Location { get; set; }
        public int? Capacity { get; set; }
        public bool IsRecurring { get; set; }
        public string RecurrenceRule { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? PictureId { get; set; } // Add this line
    }

    // DTO for updating an event from the admin panel
    public class AdminUpdateEventDto
    {
        public string EventName { get; set; }
        public string Description { get; set; }
        public Guid? HostId { get; set; }
        public string Location { get; set; }
        public int? Capacity { get; set; }
        public bool IsRecurring { get; set; }
        public string RecurrenceRule { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? PictureId { get; set; } // Add this line
    }

    // DTO for canceling an event instance
    public class CancelInstanceDto
    {
        public int InstanceId { get; set; }
        public string Notes { get; set; } = "";
    }

    // DTO for rescheduling an event instance
    public class RescheduleInstanceDto
    {
        public int InstanceId { get; set; }
        public string Notes { get; set; } = "";
        public DateTime NewStartTime { get; set; }
        public DateTime NewEndTime { get; set; }
    }
}
