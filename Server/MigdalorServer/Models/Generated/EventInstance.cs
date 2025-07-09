using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("Event_Instances")]
    [Index("StartTime", Name = "IX_EventInstances_StartTime")]
    public partial class EventInstance
    {
        public EventInstance()
        {
            Attendances = new HashSet<Attendance>();
        }

        [Key]
        [Column("InstanceID")]
        public int InstanceId { get; set; }
        [Column("EventID")]
        public int EventId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        [ForeignKey("EventId")]
        [InverseProperty("EventInstances")]
        public virtual Event Event { get; set; } = null!;
        [InverseProperty("Instance")]
        public virtual ICollection<Attendance> Attendances { get; set; }
    }
}
