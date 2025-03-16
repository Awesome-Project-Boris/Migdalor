using Microsoft.Data.SqlClient;
namespace MigdalorServer.BL
{
    public class Notice
    {
        private int id;
        private int senderId;
        private DateTime date;
        private string noticeTitle;
        private string noticeMessage;
        private string noticeCategory;
        private int noticeSubCategory;

        public Notice() { }
        public Notice(int id, int senderId, DateTime date, string noticeTitle, string noticeMessage, string noticeCategory, int noticeSubCategory)
        {
            Id = id;
            SenderId = senderId;
            Date = date;
            NoticeTitle = noticeTitle;
            NoticeMessage = noticeMessage;
            NoticeCategory = noticeCategory;
            NoticeSubCategory = noticeSubCategory;
        }

        public int Id { get => id; set => id = value; }
        public int SenderId { get => senderId; set => senderId = value; }
        public DateTime Date { get => date; set => date = value; }
        public string NoticeTitle { get => noticeTitle; set => noticeTitle = value; }
        public string NoticeMessage { get => noticeMessage; set => noticeMessage = value; }
        public string NoticeCategory { get => noticeCategory; set => noticeCategory = value; }
        public int NoticeSubCategory { get => noticeSubCategory; set => noticeSubCategory = value; }
    }
}
