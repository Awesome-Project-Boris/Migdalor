using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models;

public partial class OhCategory
{
    public string CategoryName { get; set; } = null!;

    public virtual ICollection<OhNotice> OhNotices { get; set; } = new List<OhNotice>();
}
