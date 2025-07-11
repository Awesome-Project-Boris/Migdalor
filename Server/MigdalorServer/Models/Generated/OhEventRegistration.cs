using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_EventRegistrations")]
    [Index("EventId", "ParticipantId", Name = "UQ_Registration_Event_Participant", IsUnique = true)]
    public partial class OhEventRegistration
    {
        [Key]
        [Column("RegistrationID")]
        public int RegistrationId { get; set; }
        [Column("EventID")]
        public int EventId { get; set; }
        [Column("ParticipantID")]
        public Guid ParticipantId { get; set; }
        public DateTime RegistrationDate { get; set; }
        [StringLength(50)]
        public string Status { get; set; } = null!;

        [ForeignKey("EventId")]
        [InverseProperty("OhEventRegistrations")]
        public virtual OhEvent Event { get; set; } = null!;
    }
}
