using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Notices")]
    public partial class OhNotice
    {
        [Key]
        [Column("noticeID")]
        public int NoticeId { get; set; }
        [Column("senderID")]
        public Guid? SenderId { get; set; }
        [Column("creationDate", TypeName = "datetime")]
        public DateTime? CreationDate { get; set; }
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
        [StringLength(100)]
        [Unicode(false)]
        public string? NoticeSubCategory { get; set; }

        [ForeignKey("NoticeCategory")]
        [InverseProperty("OhNotices")]
        public virtual OhCategory? NoticeCategoryNavigation { get; set; }
        [ForeignKey("SenderId")]
        [InverseProperty("OhNotices")]
        public virtual OhPerson? Sender { get; set; }
    }
}
