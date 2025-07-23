using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_InfoSheet")]
    public partial class OhInfoSheet
    {
        [Key]
        [StringLength(100)]
        public string InfoKey { get; set; } = null!;
        public string InfoValue { get; set; } = null!;
    }
}
