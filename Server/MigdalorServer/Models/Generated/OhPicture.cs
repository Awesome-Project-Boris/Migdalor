using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Pictures")]
    public partial class OhPicture
    {
        public OhPicture()
        {
            OhActivities = new HashSet<OhActivity>();
            OhNotices = new HashSet<OhNotice>();
            OhPeople = new HashSet<OhPerson>();
            OhResidentAdditionalPic1s = new HashSet<OhResident>();
            OhResidentAdditionalPic2s = new HashSet<OhResident>();
            OhServices = new HashSet<OhService>();
        }

        [Key]
        [Column("picID")]
        public int PicId { get; set; }
        [Column("picName")]
        [Unicode(false)]
        public string PicName { get; set; } = null!;
        [Column("picPath")]
        [Unicode(false)]
        public string PicPath { get; set; } = null!;
        [Column("picAlt")]
        [StringLength(255)]
        [Unicode(false)]
        public string PicAlt { get; set; } = null!;
        [Column("uploaderID")]
        public Guid? UploaderId { get; set; }
        [Column("picRole")]
        [StringLength(50)]
        [Unicode(false)]
        public string? PicRole { get; set; }
        [Column("ListingID")]
        public int? ListingId { get; set; }
        [Column("dateTime", TypeName = "datetime")]
        public DateTime DateTime { get; set; }

        [ForeignKey("ListingId")]
        [InverseProperty("OhPictures")]
        public virtual OhListing? Listing { get; set; }
        [ForeignKey("UploaderId")]
        [InverseProperty("OhPictures")]
        public virtual OhPerson? Uploader { get; set; }
        [InverseProperty("Pic")]
        public virtual ICollection<OhActivity> OhActivities { get; set; }
        [InverseProperty("Picture")]
        public virtual ICollection<OhNotice> OhNotices { get; set; }
        [InverseProperty("ProfilePic")]
        public virtual ICollection<OhPerson> OhPeople { get; set; }
        [InverseProperty("AdditionalPic1")]
        public virtual ICollection<OhResident> OhResidentAdditionalPic1s { get; set; }
        [InverseProperty("AdditionalPic2")]
        public virtual ICollection<OhResident> OhResidentAdditionalPic2s { get; set; }
        [InverseProperty("Picture")]
        public virtual ICollection<OhService> OhServices { get; set; }
    }
}
