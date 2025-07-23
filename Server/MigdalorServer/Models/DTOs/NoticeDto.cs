namespace MigdalorServer.Models.DTOs
{
    public class NoticeDto
    {
        public int NoticeId { get; set; }
        public Guid? SenderId { get; set; }
        public string EngSenderName { get; set; }
        public string HebSenderName { get; set; }
        public DateTime? CreationDate { get; set; }
        public string NoticeTitle { get; set; }
        public string NoticeMessage { get; set; }
        public string NoticeCategory { get; set; }
        public string NoticeSubCategory { get; set; }
        public int? PictureId { get; set; }
        public string PicturePath { get; set; }
        public string CategoryColor { get; set; }
    }
}
