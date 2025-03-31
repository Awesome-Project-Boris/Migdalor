using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models;

public partial class OhPerson
{
    [Key]
    public int PersonId { get; set; }

    [Required]
    [MaxLength(100)]
    public string HebFirstName { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string HebLastName { get; set; } = null!;

    [MaxLength(100)]
    public string? EngFirstName { get; set; }

    [MaxLength(100)]
    public string? EngLastName { get; set; }


    public int? ProfilePicId { get; set; }
    public virtual OhPicture? ProfilePic { get; set; }

    [MaxLength(2048)]
    public string? Email { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    [Required]
    [StringLength(1)]
    public string Gender { get; set; } = null!;

    public virtual ICollection<OhActivity> OhActivities { get; set; } = new List<OhActivity>();
    public virtual ICollection<OhParticipation> OhParticipations { get; set; } = new List<OhParticipation>();
    public virtual ICollection<OhPermission> PermissionNames { get; set; } = new List<OhPermission>();

    public virtual OhResident? OhResident { get; set; }

}
