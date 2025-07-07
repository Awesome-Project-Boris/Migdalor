using System;

namespace MigdalorServer.Models.DTOs
{
    // This DTO represents the complete data package sent from the EditProfile screen.
    public class UpdateProfileRequestDto
    {
        // OH_People fields
        public string MobilePhone { get; set; } = "";
        public string Email { get; set; } = "";

        // OH_Residents fields
        public string Origin { get; set; } = "";
        public string Profession { get; set; } = "";
        public string AboutMe { get; set; } = "";
        public int? ResidentApartmentNumber { get; set; }

        public Guid? SpouseId { get; set; }

        // now full picture objects rather than just IDs
        public PictureDto? ProfilePicture { get; set; }
        public PictureDto? AdditionalPicture1 { get; set; }
        public PictureDto? AdditionalPicture2 { get; set; }


        // Privacy settings 
        public Guid PersonId { get; set; }
        public PrivacySettingsDto? PrivacySettings { get; set; }
    }
}
