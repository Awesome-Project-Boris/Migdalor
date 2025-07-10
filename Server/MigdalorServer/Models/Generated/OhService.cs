using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Services")]
    public partial class OhService
    {
        public OhService()
        {
            InverseParentServiceNavigation = new HashSet<OhService>();
            OhOpeningHours = new HashSet<OhOpeningHour>();
            OhScheduleOverrides = new HashSet<OhScheduleOverride>();
        }

        [Key]
        [Column("ServiceID")]
        public int ServiceId { get; set; }
        public int? ParentService { get; set; }
        [StringLength(100)]
        public string HebrewName { get; set; } = null!;
        [StringLength(100)]
        public string? EnglishName { get; set; }
        [StringLength(500)]
        public string? HebrewDescription { get; set; }
        [StringLength(500)]
        public string? EnglishDescription { get; set; }
        public string? HebrewAddendum { get; set; }
        public string? EnglishAddendum { get; set; }
        [Column("LocationID")]
        public int? LocationId { get; set; }
        [Column("PictureID")]
        public int? PictureId { get; set; }
        [Required]
        public bool? IsActive { get; set; }

        [ForeignKey("ParentService")]
        [InverseProperty("InverseParentServiceNavigation")]
        public virtual OhService? ParentServiceNavigation { get; set; }
        [ForeignKey("PictureId")]
        [InverseProperty("OhServices")]
        public virtual OhPicture? Picture { get; set; }
        [InverseProperty("ParentServiceNavigation")]
        public virtual ICollection<OhService> InverseParentServiceNavigation { get; set; }
        [InverseProperty("Service")]
        public virtual ICollection<OhOpeningHour> OhOpeningHours { get; set; }
        [InverseProperty("Service")]
        public virtual ICollection<OhScheduleOverride> OhScheduleOverrides { get; set; }
    }
}
