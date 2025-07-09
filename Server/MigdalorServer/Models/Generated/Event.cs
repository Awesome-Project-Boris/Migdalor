using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Index("EventName", Name = "UQ_Events_EventName", IsUnique = true)]
    public partial class Event
    {
        public Event()
        {
            EventInstances = new HashSet<EventInstance>();
        }

        [Key]
        [Column("EventID")]
        public int EventId { get; set; }
        [StringLength(100)]
        public string EventName { get; set; } = null!;
        public string? Description { get; set; }
        [Column("HostID")]
        public Guid? HostId { get; set; }
        public string? Location { get; set; }
        [Column("PictureID")]
        public int? PictureId { get; set; }
        public int Capacity { get; set; }
        public bool IsRecurring { get; set; }
        [StringLength(255)]
        public string? RecurrenceRule { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [InverseProperty("Event")]
        public virtual ICollection<EventInstance> EventInstances { get; set; }
    }
}
