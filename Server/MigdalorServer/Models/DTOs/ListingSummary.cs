namespace MigdalorServer.Models.DTOs
{
    public class ListingSummary
    {
        public int ListingId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public Guid SellerId { get; set; }
        public string SellerName { get; set; } = null!; // Added Seller Name
        public string? MainImagePath { get; set; } // Path for the main image
    }
}
