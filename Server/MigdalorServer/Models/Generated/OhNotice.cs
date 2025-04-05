using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models;

[Table("OH_Notices")]
public partial class OhNotice
{
    [Key]
    [Column("noticeID")]
    public int NoticeId { get; set; }

    [Column("senderID")]
    public int? SenderId { get; set; }

    [Column("creationDate")]
    public DateOnly? CreationDate { get; set; }

    [Column("noticeTitle")]
    [StringLength(100)]
    public string NoticeTitle { get; set; } = null!;

    [Column("noticeMessage")]
    [StringLength(300)]
    public string? NoticeMessage { get; set; }

    [Column("noticeCategory")]
    [StringLength(100)]
    public string? NoticeCategory { get; set; }

    [Column("noticeSubCategory")]
    public int? NoticeSubCategory { get; set; }

    [ForeignKey("NoticeCategory")]
    [InverseProperty("OhNotices")]
    public virtual OhCategory? NoticeCategoryNavigation { get; set; }

    [ForeignKey("SenderId")]
    [InverseProperty("OhNotices")]
    public virtual OhResident? Sender { get; set; }
}
