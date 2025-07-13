using System;

namespace MigdalorServer.Models.DTOs
{
    public class CancelInstanceDto
    {
        public int InstanceId { get; set; }
        public string Notes { get; set; } = "";
    }

    public class RescheduleInstanceDto
    {
        public int InstanceId { get; set; }
        public string Notes { get; set; } = "";
        public DateTime NewStartTime { get; set; }
        public DateTime NewEndTime { get; set; }
    }
}
