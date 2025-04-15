using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models;

[Table("OH_Pictures")]
public partial class OhPicture
{
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

    [Column("auctionID")]
    public int? AuctionId { get; set; }

    [Column("dateTime", TypeName = "datetime")]
    public DateTime DateTime { get; set; }

    [InverseProperty("Pic")]
    public virtual ICollection<OhActivity> OhActivities { get; set; } = new List<OhActivity>();

    [InverseProperty("ProfilePic")]
    public virtual ICollection<OhPerson> OhPeople { get; set; } = new List<OhPerson>();

    [InverseProperty("AdditionalPic1")]
    public virtual ICollection<OhResident> OhResidentAdditionalPic1s { get; set; } = new List<OhResident>();

    [InverseProperty("AdditionalPic2")]
    public virtual ICollection<OhResident> OhResidentAdditionalPic2s { get; set; } = new List<OhResident>();

    [ForeignKey("UploaderId")]
    [InverseProperty("OhPictures")]
    public virtual OhPerson? Uploader { get; set; }
}
