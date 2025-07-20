using System;

namespace MigdalorServer.Models.DTOs
{
    public class BokerTovReportDto
    {
        public string ResidentName { get; set; }
        public string PhoneNumber { get; set; }
        public bool HasSignedIn { get; set; }
        public DateTime? SignInTime { get; set; }
        public DateTime AttendanceDate { get; set; }
    }
}
