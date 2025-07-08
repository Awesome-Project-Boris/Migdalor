namespace MigdalorServer.Models.DTOs
{
    public class PrivacySettingsDto
    {
        public bool ShowPartner { get; set; } = true;
        public bool ShowApartmentNumber { get; set; } = true;
        public bool ShowMobilePhone { get; set; } = true;
        public bool ShowEmail { get; set; } = true;
        public bool ShowArrivalYear { get; set; } = true;
        public bool ShowOrigin { get; set; } = true;
        public bool ShowProfession { get; set; } = true;
        public bool ShowInterests { get; set; } = true;
        public bool ShowAboutMe { get; set; } = true;
        public bool ShowProfilePicture { get; set; } = true;
        public bool ShowAdditionalPictures { get; set; } = true;
    }
}
