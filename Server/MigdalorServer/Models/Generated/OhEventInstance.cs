using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_EventInstances")]
    [Index("StartTime", Name = "IX_EventInstances_StartTime")]
    public partial class OhEventInstance
    {
        public OhEventInstance()
        {
            OhParticipations = new HashSet<OhParticipation>();
        }

        [Key]
        [Column("InstanceID")]
        public int InstanceId { get; set; }
        [Column("EventID")]
        public int EventId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        [ForeignKey("EventId")]
        [InverseProperty("OhEventInstances")]
        public virtual OhEvent Event { get; set; } = null!;
        [InverseProperty("Instance")]
        public virtual ICollection<OhParticipation> OhParticipations { get; set; }
    }
}
