using System;

namespace MigdalorServer.Models.DTOs
{
    public class UpdateProfileRequestDto
    {
        public Guid PersonId { get; set; }
        public string Email { get; set; }
        public int ResidentApartmentNumber { get; set; }
        public string Origin { get; set; }
        public string Profession { get; set; }
        public string AboutMe { get; set; }

        // Include other fields from your EditProfile form as needed...

        // This property holds the privacy settings from the modal
        public PrivacySettingsDto PrivacySettings { get; set; }
    }
}
