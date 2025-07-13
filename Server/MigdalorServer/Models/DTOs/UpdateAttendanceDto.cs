namespace MigdalorServer.Models.DTOs
{
    public class UpdateAttendanceDto
    {
        public int InstanceId { get; set; }
        public Guid ParticipantId { get; set; }
        public string Status { get; set; }
    }
}
