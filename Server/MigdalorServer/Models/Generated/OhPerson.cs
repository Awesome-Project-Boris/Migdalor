using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models;

[Table("OH_People")]
public partial class OhPerson
{
    [Key]
    [Column("personID")]
    public int PersonId { get; set; }

    [Column("hebFirstName")]
    [StringLength(100)]
    public string HebFirstName { get; set; } = null!;

    [Column("hebLastName")]
    [StringLength(100)]
    public string HebLastName { get; set; } = null!;

    [Column("engFirstName")]
    [StringLength(100)]
    public string? EngFirstName { get; set; }

    [Column("engLastName")]
    [StringLength(100)]
    public string? EngLastName { get; set; }

    [Column("profilePicID")]
    public int? ProfilePicId { get; set; }

    [Column("email")]
    [StringLength(2048)]
    [Unicode(false)]
    public string? Email { get; set; }

    [Column("dateOfBirth")]
    public DateOnly? DateOfBirth { get; set; }

    [Column("gender")]
    [StringLength(1)]
    [Unicode(false)]
    public string Gender { get; set; } = null!;

    [StringLength(512)]
    public string? PasswordHash { get; set; }

    [InverseProperty("Host")]
    public virtual ICollection<OhActivity> OhActivities { get; set; } = new List<OhActivity>();

    [InverseProperty("Participant")]
    public virtual ICollection<OhParticipation> OhParticipations { get; set; } = new List<OhParticipation>();

    [InverseProperty("Resident")]
    public virtual OhResident? OhResident { get; set; }

    [ForeignKey("ProfilePicId")]
    [InverseProperty("OhPeople")]
    public virtual OhPicture? ProfilePic { get; set; }

    [ForeignKey("PersonId")]
    [InverseProperty("People")]
    public virtual ICollection<OhPermission> PermissionNames { get; set; } = new List<OhPermission>();
}
