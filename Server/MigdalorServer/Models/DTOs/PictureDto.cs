namespace MigdalorServer.Models.DTOs
{
    public class PictureDto
    {
        public int PicID { get; set; }
        //public string PicName { get; set; } = "";
        public string PicPath { get; set; } = "";
        public string PicAlt { get; set; } = "";
        public Guid UploaderId { get; set; }
        public string PicRole { get; set; } = "";
        public DateTime DateTime { get; set; }
    }
}
