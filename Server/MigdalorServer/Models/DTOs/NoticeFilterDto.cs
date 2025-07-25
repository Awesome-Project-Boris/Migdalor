namespace MigdalorServer.Models.DTOs
{
    public class NoticeFilterDto
    {
        // A list of category names to filter by
        public List<string> Categories { get; set; }

        // The desired sort order: "newest" or "oldest"
        public string SortOrder { get; set; }
    }
}
