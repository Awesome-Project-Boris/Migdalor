using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_People")]
    [Index("PhoneNumber", Name = "UQ__OH_Peopl__4849DA012C26934B", IsUnique = true)]
    public partial class OhPerson
    {
        public OhPerson()
        {
            OhActivities = new HashSet<OhActivity>();
            OhListings = new HashSet<OhListing>();
            OhNotices = new HashSet<OhNotice>();
            OhParticipations = new HashSet<OhParticipation>();
            OhPictures = new HashSet<OhPicture>();
            PermissionNames = new HashSet<OhPermission>();
        }

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
        [Column("dateOfBirth", TypeName = "date")]
        public DateTime? DateOfBirth { get; set; }
        [Column("personRole")]
        [StringLength(50)]
        [Unicode(false)]
        public string? PersonRole { get; set; }
        [Column("pushToken")]
        [StringLength(100)]
        [Unicode(false)]
        public string? PushToken { get; set; }

        [ForeignKey("ProfilePicId")]
        [InverseProperty("OhPeople")]
        public virtual OhPicture? ProfilePic { get; set; }
        [InverseProperty("Resident")]
        public virtual OhResident? OhResident { get; set; }
        [InverseProperty("User")]
        public virtual OhUserSetting? OhUserSetting { get; set; }
        [InverseProperty("Host")]
        public virtual ICollection<OhActivity> OhActivities { get; set; }
        [InverseProperty("Seller")]
        public virtual ICollection<OhListing> OhListings { get; set; }
        [InverseProperty("Sender")]
        public virtual ICollection<OhNotice> OhNotices { get; set; }
        [InverseProperty("Participant")]
        public virtual ICollection<OhParticipation> OhParticipations { get; set; }
        [InverseProperty("Uploader")]
        public virtual ICollection<OhPicture> OhPictures { get; set; }

        [ForeignKey("PersonId")]
        [InverseProperty("People")]
        public virtual ICollection<OhPermission> PermissionNames { get; set; }
    }
}
