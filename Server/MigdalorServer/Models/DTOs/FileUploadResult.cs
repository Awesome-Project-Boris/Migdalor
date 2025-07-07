namespace MigdalorServer.Models.DTOs
{
    public class FileUploadResult
    {
        public bool Success { get; set; }
        public string OriginalFileName { get; set; }
        public string ServerPath { get; set; }
        public int? PicId { get; set; }
        public string ErrorMessage { get; set; }
    }
}
