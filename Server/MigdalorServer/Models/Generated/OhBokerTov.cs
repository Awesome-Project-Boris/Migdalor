using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_BokerTov")]
    [Index("ResidentId", "AttendanceDate", Name = "UQ_OH_DailyAttendance_ResidentDate", IsUnique = true)]
    public partial class OhBokerTov
    {
        [Key]
        public int Id { get; set; }
        public Guid ResidentId { get; set; }
        [Column(TypeName = "date")]
        public DateTime AttendanceDate { get; set; }
        public bool HasSignedIn { get; set; }
        public DateTime? SignInTime { get; set; }

        [ForeignKey("ResidentId")]
        [InverseProperty("OhBokerTovs")]
        public virtual OhResident Resident { get; set; } = null!;
    }
}
