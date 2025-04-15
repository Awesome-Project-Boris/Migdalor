using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models;

[Table("OH_Categories")]
[Index("CategoryColor", Name = "UQ_CategoryColor", IsUnique = true)]
public partial class OhCategory
{
    [Key]
    [StringLength(100)]
    public string CategoryName { get; set; } = null!;

    [StringLength(7)]
    [Unicode(false)]
    public string? CategoryColor { get; set; }

    [InverseProperty("NoticeCategoryNavigation")]
    public virtual ICollection<OhNotice> OhNotices { get; set; } = new List<OhNotice>();
}
