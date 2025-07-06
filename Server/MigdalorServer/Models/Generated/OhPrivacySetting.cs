using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_PrivacySettings")]
    public partial class OhPrivacySetting
    {
        [Key]
        [Column("PersonID")]
        public Guid PersonId { get; set; }
        [Required]
        public bool? ShowPartner { get; set; }
        [Required]
        public bool? ShowApartmentNumber { get; set; }
        [Required]
        public bool? ShowMobilePhone { get; set; }
        [Required]
        public bool? ShowEmail { get; set; }
        [Required]
        public bool? ShowArrivalYear { get; set; }
        [Required]
        public bool? ShowOrigin { get; set; }
        [Required]
        public bool? ShowProfession { get; set; }
        [Required]
        public bool? ShowInterests { get; set; }
        [Required]
        public bool? ShowAboutMe { get; set; }
        [Required]
        public bool? ShowProfilePicture { get; set; }
        [Required]
        public bool? ShowAdditionalPictures { get; set; }

        [ForeignKey("PersonId")]
        [InverseProperty("OhPrivacySetting")]
        public virtual OhPerson Person { get; set; } = null!;
    }
}
