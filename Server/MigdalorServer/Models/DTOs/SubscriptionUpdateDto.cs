namespace MigdalorServer.Models.DTOs
{
    public class SubscriptionUpdateDto
    {
        public Guid ResidentId { get; set; }
        public string CategoryHebName { get; set; }
        public bool IsSubscribed { get; set; }
    }
}
