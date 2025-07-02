using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Participation")]
    public partial class OhParticipation
    {
        [Key]
        [Column("activityID")]
        public int ActivityId { get; set; }
        [Key]
        [Column("participantID")]
        public Guid ParticipantId { get; set; }
        [Key]
        [Column("participationDate", TypeName = "date")]
        public DateTime ParticipationDate { get; set; }

        [ForeignKey("ActivityId")]
        [InverseProperty("OhParticipations")]
        public virtual OhActivity Activity { get; set; } = null!;
        [ForeignKey("ParticipantId")]
        [InverseProperty("OhParticipations")]
        public virtual OhPerson Participant { get; set; } = null!;
    }
}
