namespace MigdalorServer.Models.DTOs
{
    public class MapApartmentDto
    {
        public Guid ApartmentNumber { get; set; }
        public string ApartmentName { get; set; }
        public int DisplayNumber { get; set; }
        public List<MapResidentDto> Residents { get; set; }
    }
}
