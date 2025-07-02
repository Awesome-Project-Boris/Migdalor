using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Interests")]
    [Index("HebName", Name = "UQ__OH_Inter__6768DE0BE882E523", IsUnique = true)]
    [Index("EngName", Name = "UQ__OH_Inter__A7D060A8DB358DD9", IsUnique = true)]
    public partial class OhInterest
    {
        [Key]
        [Column("interestID")]
        public int InterestId { get; set; }
        [Column("category")]
        public int Category { get; set; }
        [Column("hebName")]
        [StringLength(50)]
        public string HebName { get; set; } = null!;
        [Column("engName")]
        [StringLength(50)]
        public string EngName { get; set; } = null!;

        [ForeignKey("Category")]
        [InverseProperty("OhInterests")]
        public virtual OhInterestCategory CategoryNavigation { get; set; } = null!;
    }
}
