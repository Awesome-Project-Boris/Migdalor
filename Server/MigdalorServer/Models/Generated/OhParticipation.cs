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
        [Column("ActivityID")]
        public int ActivityId { get; set; }
        [Key]
        [Column("ParticipantID")]
        public Guid ParticipantId { get; set; }
        [Key]
        [Column(TypeName = "date")]
        public DateTime SessionDate { get; set; }
        [StringLength(20)]
        public string ParticipationStatus { get; set; } = null!;
        [Column(TypeName = "datetime")]
        public DateTime? RegistrationDate { get; set; }

        [ForeignKey("ActivityId")]
        [InverseProperty("OhParticipations")]
        public virtual OhActivity Activity { get; set; } = null!;
        [ForeignKey("ParticipantId")]
        [InverseProperty("OhParticipations")]
        public virtual OhPerson Participant { get; set; } = null!;
    }
}
