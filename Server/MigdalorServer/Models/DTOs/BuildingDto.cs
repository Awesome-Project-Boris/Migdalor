namespace MigdalorServer.Models.DTOs
{
    public class BuildingDto
    {
        public Guid BuildingID { get; set; }
        public string BuildingName { get; set; }
        public string Coordinates { get; set; }
        public List<int> EntranceNodeIds { get; set; } 
        public List<MapApartmentDto> Apartments { get; set; }
    }
}
