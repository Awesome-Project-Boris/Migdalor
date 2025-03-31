using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models;

public partial class OhNotice
{
    [Key]
    public int NoticeId { get; set; }

    [Required]
    public int? SenderId { get; set; } = null!;
    public virtual OhResident? Sender { get; set; }

    public DateTime CreationDate { get; set; } = DateTime.Now;

    [Required]
    [MaxLength(100)]
    public string NoticeTitle { get; set; } = null!;

    [MaxLength(300)]
    public string? NoticeMessage { get; set; } = null;

    [Required]
    [MaxLength(100)]
    public string? NoticeCategory { get; set; } = "כללי";
    public virtual OhCategory? NoticeCategoryNavigation { get; set; }

    //reference foreign key from people or class or activity
    public int? NoticeSubCategory { get; set; }


}
