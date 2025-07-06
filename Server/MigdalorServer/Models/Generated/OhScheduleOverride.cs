using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_ScheduleOverrides")]
    public partial class OhScheduleOverride
    {
        [Key]
        [Column("OverrideID")]
        public int OverrideId { get; set; }
        [Column("ServiceID")]
        public int ServiceId { get; set; }
        [Column(TypeName = "date")]
        public DateTime OverrideDate { get; set; }
        public bool IsOpen { get; set; }
        public TimeSpan? OpenTime { get; set; }
        public TimeSpan? CloseTime { get; set; }
        [StringLength(500)]
        public string Notes { get; set; } = null!;

        [ForeignKey("ServiceId")]
        [InverseProperty("OhScheduleOverrides")]
        public virtual OhService Service { get; set; } = null!;
    }
}
