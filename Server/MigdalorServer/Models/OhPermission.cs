using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models;

public partial class OhPermission
{
    [Key]
    [MaxLength(100)]
    public string PermissionName { get; set; } = null!;

    public virtual ICollection<OhPerson> People { get; set; } = new List<OhPerson>();
}
