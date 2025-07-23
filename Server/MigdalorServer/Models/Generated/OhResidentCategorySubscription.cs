using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_ResidentCategorySubscriptions")]
    public partial class OhResidentCategorySubscription
    {
        [Key]
        [Column("residentID")]
        public Guid ResidentId { get; set; }
        [Key]
        [Column("categoryHebName")]
        [StringLength(100)]
        public string CategoryHebName { get; set; } = null!;
        [Required]
        [Column("isSubscribed")]
        public bool? IsSubscribed { get; set; }

        [ForeignKey("CategoryHebName")]
        [InverseProperty("OhResidentCategorySubscriptions")]
        public virtual OhCategory CategoryHebNameNavigation { get; set; } = null!;
        [ForeignKey("ResidentId")]
        [InverseProperty("OhResidentCategorySubscriptions")]
        public virtual OhResident Resident { get; set; } = null!;
    }
}
