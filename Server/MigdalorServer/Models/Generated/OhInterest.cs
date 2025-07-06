using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Interests")]
    public partial class OhInterest
    {
        public OhInterest()
        {
            Residents = new HashSet<OhResident>();
        }

        [Key]
        [Column("interestName")]
        [StringLength(50)]
        public string InterestName { get; set; } = null!;

        [ForeignKey("InterestName")]
        [InverseProperty("InterestNames")]
        public virtual ICollection<OhResident> Residents { get; set; }
    }
}
