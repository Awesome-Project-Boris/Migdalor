using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models;

public partial class OhPicture
{
    [Key]
    public int PicId { get; set; }

    [Required]
    [MaxLength(255)]
    public string PicName { get; set; } = null!;

    [Required]
    public string PicPath { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    public string PicAlt { get; set; } = null!;

    public virtual ICollection<OhActivity> OhActivities { get; set; } = new List<OhActivity>();

    public virtual ICollection<OhPerson> OhPeople { get; set; } = new List<OhPerson>();

    public virtual ICollection<OhResident> OhResidentAdditionalPic1s { get; set; } = new List<OhResident>();

    public virtual ICollection<OhResident> OhResidentAdditionalPic2s { get; set; } = new List<OhResident>();
}
