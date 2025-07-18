namespace MigdalorServer.Models.DTOs
{
    public class ApartmentDto
    {
        public Guid ApartmentNumber { get; set; }
        public int DisplayNumber { get; set; }
        public Guid PhysicalBuildingID { get; set; }
        public Guid AccessBuildingID { get; set; }
    }
}
