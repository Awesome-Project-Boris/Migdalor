using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Classes")]
    public partial class OhClass
    {
        [Key]
        [Column("classID")]
        public int ClassId { get; set; }
        [Column("isRecurring")]
        public bool? IsRecurring { get; set; }
        [Column("recurrenceLevel")]
        public int RecurrenceLevel { get; set; }
        [Column("recurrenceDetails")]
        [Unicode(false)]
        public string? RecurrenceDetails { get; set; }
        [Column("sessionAmount")]
        public int? SessionAmount { get; set; }

        [ForeignKey("ClassId")]
        [InverseProperty("OhClass")]
        public virtual OhActivity Class { get; set; } = null!;
    }
}
