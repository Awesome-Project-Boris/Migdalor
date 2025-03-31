using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models;

public partial class OhResident
{
    [Key]
    public int ResidentId { get; set; }
    public virtual OhPerson Resident { get; set; } = null!;

    [Required]
    public bool HasLoggedIn { get; set; } = false;

    [Required]
    public bool IsActive { get; set; } = false;

    [Required]
    [MaxLength(100)]
    public string BranchName { get; set; } = null!;

    public bool IsBokerTov { get; set; } = true;

    public bool CanInitActivity { get; set; } = false;

    public int SpouseId { get; set; }
    public virtual OhResident Spouse { get; set; } = null!;

    [Required]
    public DateOnly DateOfArrival { get; set; }

    [MaxLength(100)]
    public string? HomePlace { get; set; }

    [StringLength(10)]
    public string? PhoneNumber { get; set; }

    [MaxLength(100)]
    public string? Profession { get; set; }

    public string? ResidentDescription { get; set; }

    public int? AdditionalPic1Id { get; set; }
    public virtual OhPicture? AdditionalPic1 { get; set; }


    public int? AdditionalPic2Id { get; set; }
    public virtual OhPicture? AdditionalPic2 { get; set; }



    public virtual ICollection<OhResident> InverseSpouse { get; set; } = new List<OhResident>();

    public virtual ICollection<OhNotice> OhNotices { get; set; } = new List<OhNotice>();


}
