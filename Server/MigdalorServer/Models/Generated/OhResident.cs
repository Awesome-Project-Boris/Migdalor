using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models;

[Table("OH_Residents")]
public partial class OhResident
{
    [Key]
    [Column("residentID")]
    public int ResidentId { get; set; }

    [Column("hasLoggedIn")]
    public bool HasLoggedIn { get; set; }

    [Column("isActive")]
    public bool IsActive { get; set; }

    [Column("branchName")]
    [StringLength(100)]
    public string BranchName { get; set; } = null!;

    [Column("isBokerTov")]
    public bool IsBokerTov { get; set; }

    [Column("canInitActivity")]
    public bool CanInitActivity { get; set; }

    [Column("spouseID")]
    public int SpouseId { get; set; }

    [Column("dateOfArrival")]
    public DateOnly DateOfArrival { get; set; }

    [Column("homePlace")]
    [StringLength(100)]
    public string? HomePlace { get; set; }

    [Column("phoneNumber")]
    [StringLength(10)]
    [Unicode(false)]
    public string? PhoneNumber { get; set; }

    [Column("profession")]
    [StringLength(100)]
    public string? Profession { get; set; }

    [Column("residentDescription")]
    public string? ResidentDescription { get; set; }

    [Column("additionalPic1ID")]
    public int? AdditionalPic1Id { get; set; }

    [Column("additionalPic2ID")]
    public int? AdditionalPic2Id { get; set; }

    [ForeignKey("AdditionalPic1Id")]
    [InverseProperty("OhResidentAdditionalPic1s")]
    public virtual OhPicture? AdditionalPic1 { get; set; }

    [ForeignKey("AdditionalPic2Id")]
    [InverseProperty("OhResidentAdditionalPic2s")]
    public virtual OhPicture? AdditionalPic2 { get; set; }

    [InverseProperty("Spouse")]
    public virtual ICollection<OhResident> InverseSpouse { get; set; } = new List<OhResident>();

    [InverseProperty("Sender")]
    public virtual ICollection<OhNotice> OhNotices { get; set; } = new List<OhNotice>();

    [ForeignKey("ResidentId")]
    [InverseProperty("OhResident")]
    public virtual OhPerson Resident { get; set; } = null!;

    [ForeignKey("SpouseId")]
    [InverseProperty("InverseSpouse")]
    public virtual OhResident Spouse { get; set; } = null!;
}
