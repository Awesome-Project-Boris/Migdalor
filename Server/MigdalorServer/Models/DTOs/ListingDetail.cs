namespace MigdalorServer.Models.DTOs
{
    public class ListingDetail
    {
        public int ListingId { get; set; }

        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public DateTime Date { get; set; }

        public bool IsActive { get; set; } 


        // Seller Info
        public Guid SellerId { get; set; }
        public string SellerName { get; set; } = null!;
        public string? SellerEmail { get; set; } 
        public string? SellerPhone { get; set; } 

        

        public PictureDetail? MainPicture { get; set; }
        public PictureDetail? ExtraPicture { get; set; }
    }
}
