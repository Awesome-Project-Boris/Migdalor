using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Participation")]
    [Index("EventId", "ParticipantId", Name = "UQ_Participation_Event_Participant", IsUnique = true)]
    public partial class OhParticipation
    {
        [Key]
        [Column("ParticipationID")]
        public int ParticipationId { get; set; }
        [Column("EventID")]
        public int EventId { get; set; }
        [Column("ParticipantID")]
        public Guid ParticipantId { get; set; }
        public DateTime RegistrationTime { get; set; }
        [StringLength(50)]
        public string Status { get; set; } = null!;

        [ForeignKey("EventId")]
        [InverseProperty("OhParticipations")]
        public virtual OhEvent Event { get; set; } = null!;
    }
}
