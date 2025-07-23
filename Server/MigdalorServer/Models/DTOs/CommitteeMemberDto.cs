namespace MigdalorServer.Models.DTOs
{
    public class CommitteeMemberDto
    {
        public Guid UserId { get; set; }
        public string? HebName { get; set; }
        public string? EngName { get; set; }
        public string? HebCommitteeTitle { get; set; }
        public string? EngCommitteeTitle { get; set; }
        public string? PhotoUrl { get; set; }
    }
}
