using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_OpeningHours")]
    public partial class OhOpeningHour
    {
        [Key]
        [Column("HourID")]
        public int HourId { get; set; }
        [Column("ServiceID")]
        public int ServiceId { get; set; }
        public int DayOfWeek { get; set; }
        public TimeSpan OpenTime { get; set; }
        public TimeSpan CloseTime { get; set; }

        [ForeignKey("ServiceId")]
        [InverseProperty("OhOpeningHours")]
        public virtual OhService Service { get; set; } = null!;
    }
}
