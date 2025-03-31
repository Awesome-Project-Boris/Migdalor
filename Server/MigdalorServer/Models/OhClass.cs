using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models;

public partial class OhClass
{
    [Key, ForeignKey("OhActivity")]
    public int ClassId { get; set; }

    public bool? IsRecurring { get; set; } = false;

    [Required]
    public int RecurrenceLevel { get; set; } = 0;

    public string? RecurrenceDetails { get; set; }

    [Required]
    public int? SessionAmount { get; set; }

    public virtual OhActivity Class { get; set; } = null!;
}
