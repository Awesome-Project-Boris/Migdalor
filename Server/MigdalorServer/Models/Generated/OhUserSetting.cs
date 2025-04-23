using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models;

[Table("OH_UserSettings")]
public partial class OhUserSetting
{
    [Key]
    [Column("userID")]
    public Guid UserId { get; set; }

    [Column("userSelectedDirection")]
    [StringLength(3)]
    [Unicode(false)]
    public string UserSelectedDirection { get; set; } = null!;

    [Column("userSelectedFontSize")]
    public int UserSelectedFontSize { get; set; }

    [Column("userSelectedLanguage")]
    [StringLength(3)]
    [Unicode(false)]
    public string? UserSelectedLanguage { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("OhUserSetting")]
    public virtual OhPerson User { get; set; } = null!;
}
