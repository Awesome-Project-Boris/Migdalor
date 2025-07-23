using System.Collections.Generic;

namespace Migdalor.DTOs
{
    public class ServiceDto
    {
        public int ServiceID { get; set; }
        public int? ParentService { get; set; }
        public string HebrewName { get; set; }
        public string EnglishName { get; set; }
        public string HebrewDescription { get; set; }
        public string EnglishDescription { get; set; }
        public string HebrewAddendum { get; set; }
        public string EnglishAddendum { get; set; }
        public int? PictureID { get; set; }
        public string? PicturePath { get; set; } // Added this property
        public bool IsActive { get; set; }

        public List<OpeningHourDto> OpeningHours { get; set; } = new List<OpeningHourDto>();
        public List<ServiceDto> SubServices { get; set; } = new List<ServiceDto>();
    }
}
