using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Keyless]
    [Table("OH_TimeTableAdditions")]
    public partial class OhTimeTableAddition
    {
        public int Id { get; set; }
        [StringLength(255)]
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        [StringLength(255)]
        public string? Location { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        [StringLength(100)]
        public string? Type { get; set; }
        public DateTime DateAdded { get; set; }
    }
}
