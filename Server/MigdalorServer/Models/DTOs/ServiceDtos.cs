namespace Migdalor.DTOs
{
    /// <summary>
    /// DTO for creating a new service.
    /// </summary>
    public class ServiceCreateDto
    {
        public string HebrewName { get; set; }
        public int? ParentServiceID { get; set; }
    }

    /// <summary>
    /// DTO for updating an existing service.
    /// </summary>
    public class ServiceUpdateDto
    {
        public int ServiceID { get; set; }
        public string HebrewName { get; set; }
    }
}
