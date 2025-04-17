namespace MigdalorServer.Models.DTOs
{
    public class PictureDetail
    {
        public int PicId { get; set; }

        public string PicPath { get; set; } = null!;

        public string? PicAlt { get; set; }

        public DateTime DateTime { get; set; }
    }
}
