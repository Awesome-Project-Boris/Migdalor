using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models;

[Table("OH_People")]
[Index("PhoneNumber", Name = "UQ__OH_Peopl__4849DA012C26934B", IsUnique = true)]
public partial class OhPerson
{
    [Key]
    [Column("personID")]
    public Guid PersonId { get; set; }

    [Column("phoneNumber")]
    [StringLength(15)]
    [Unicode(false)]
    public string PhoneNumber { get; set; } = null!;

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

    [Column("gender")]
    [StringLength(1)]
    [Unicode(false)]
    public string Gender { get; set; } = null!;

    [Column("profilePicID")]
    public int? ProfilePicId { get; set; }

    [Column("email")]
    [StringLength(2048)]
    [Unicode(false)]
    public string? Email { get; set; }

    [Column("passwordHash")]
    [StringLength(128)]
    [Unicode(false)]
    public string PasswordHash { get; set; } = null!;

    [Column("dateOfBirth")]
    public DateOnly? DateOfBirth { get; set; }

    [Column("personRole")]
    [StringLength(50)]
    [Unicode(false)]
    public string? PersonRole { get; set; }

    [InverseProperty("Host")]
    public virtual ICollection<OhActivity> OhActivities { get; set; } = new List<OhActivity>();

    [InverseProperty("Sender")]
    public virtual ICollection<OhNotice> OhNotices { get; set; } = new List<OhNotice>();

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
