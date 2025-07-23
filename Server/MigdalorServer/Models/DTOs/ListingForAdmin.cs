namespace MigdalorServer.Models.DTOs
{
    public class ListingForAdmin
    {
        public int ListingId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public bool? IsActive { get; set; }
        public string SellerName { get; set; }
        public string SellerEmail { get; set; }
        public string? MainPicturePath { get; set; } // New Property
        public string? ExtraPicturePath { get; set; } // New Property
    }
}
