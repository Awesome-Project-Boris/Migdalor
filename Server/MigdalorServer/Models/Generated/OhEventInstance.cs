using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_EventInstances")]
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
        [StringLength(50)]
        public string Status { get; set; } = null!;
        [StringLength(500)]
        public string? Notes { get; set; }

        [ForeignKey("EventId")]
        [InverseProperty("OhEventInstances")]
        public virtual OhEvent Event { get; set; } = null!;
        [InverseProperty("Instance")]
        public virtual ICollection<OhParticipation> OhParticipations { get; set; }
    }
}
