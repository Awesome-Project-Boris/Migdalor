namespace MigdalorServer.Models.DTOs
{
    public class UpdateProfileDto
    {
        // OH_People fields
        public string MobilePhone { get; set; } = "";
        public string Email { get; set; } = "";

        // OH_Residents fields
        public string Origin { get; set; } = "";
        public string Profession { get; set; } = "";
        public string AboutMe { get; set; } = "";
        public Guid? ResidentApartmentNumber { get; set; }

        public Guid? SpouseId { get; set; }

        // now full picture objects rather than just IDs
        public PictureDto? ProfilePicture { get; set; }
        public PictureDto? AdditionalPicture1 { get; set; }
        public PictureDto? AdditionalPicture2 { get; set; }

        public List<string> InterestNames { get; set; } = new List<string>();
        public List<string> NewInterestNames { get; set; } = new List<string>();

    }
}
