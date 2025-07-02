using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_InterestCategories")]
    public partial class OhInterestCategory
    {
        public OhInterestCategory()
        {
            OhInterests = new HashSet<OhInterest>();
        }

        [Key]
        [Column("categoryID")]
        public int CategoryId { get; set; }
        [Column("categoryHebName")]
        [StringLength(50)]
        public string CategoryHebName { get; set; } = null!;
        [Column("categoryEngName")]
        [StringLength(50)]
        [Unicode(false)]
        public string CategoryEngName { get; set; } = null!;

        [InverseProperty("CategoryNavigation")]
        public virtual ICollection<OhInterest> OhInterests { get; set; }
    }
}
