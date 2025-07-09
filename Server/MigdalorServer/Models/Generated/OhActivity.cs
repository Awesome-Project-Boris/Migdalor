using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Activities")]
    [Index("ActivityName", Name = "UQ__OH_Activ__BD8CC0A98C74AE38", IsUnique = true)]
    public partial class OhActivity
    {
        [Key]
        [Column("activityID")]
        public int ActivityId { get; set; }
        [Column("activityName")]
        [StringLength(100)]
        public string ActivityName { get; set; } = null!;
        [Column("startDate", TypeName = "datetime")]
        public DateTime StartDate { get; set; }
        [Column("capacity")]
        public int Capacity { get; set; }
        [Column("hostID")]
        public Guid? HostId { get; set; }
        [Column("location")]
        public string? Location { get; set; }
        [Column("PicID")]
        public int? PicId { get; set; }
        [Column("endDate", TypeName = "datetime")]
        public DateTime? EndDate { get; set; }

        [ForeignKey("HostId")]
        [InverseProperty("OhActivities")]
        public virtual OhPerson? Host { get; set; }
        [ForeignKey("PicId")]
        [InverseProperty("OhActivities")]
        public virtual OhPicture? Pic { get; set; }
    }
}
