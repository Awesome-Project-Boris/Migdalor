using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("Attendance")]
    [Index("InstanceId", "ParticipantId", Name = "UQ_Attendance_Instance_Participant", IsUnique = true)]
    public partial class Attendance
    {
        [Key]
        [Column("AttendanceID")]
        public int AttendanceId { get; set; }
        [Column("InstanceID")]
        public int InstanceId { get; set; }
        [Column("ParticipantID")]
        public Guid ParticipantId { get; set; }
        public DateTime? SignInTime { get; set; }
        [StringLength(50)]
        public string Status { get; set; } = null!;

        [ForeignKey("InstanceId")]
        [InverseProperty("Attendances")]
        public virtual EventInstance Instance { get; set; } = null!;
    }
}
