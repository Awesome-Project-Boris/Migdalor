using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models;

public partial class OhActivity
{
    [Key]
    public int ActivityId { get; set; }

    [Required]
    [MaxLength(100)]
    public string ActivityName { get; set; } = null!;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public int Capacity { get; set; }


    public int? HostId { get; set; }
    public virtual OhPerson? Host { get; set; }


    public string? Location { get; set; }

    public int? PicId { get; set; }
    public virtual OhPicture? Pic { get; set; }


    public virtual OhClass? OhClass { get; set; }

    public virtual ICollection<OhParticipation> OhParticipations { get; set; } = new List<OhParticipation>();

}
