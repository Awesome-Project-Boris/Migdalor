using MigdalorServer.Database;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Models
{
    public partial class OhNotice
    {
        public static List<OhNotice> GetOhNotices()
        {
            using MigdalorDBContext db = new();
            return db.OhNotices.ToList();
        }

        public static OhNotice AddOhNotice(NewNotice notice)
        {
            var ohNotice = new OhNotice
            {
                NoticeTitle = notice.Title,
                NoticeMessage = notice.Content,
                SenderId = notice.SenderId,
                NoticeCategory = notice.Category,
                NoticeSubCategory = notice.SubCategory,
            };

            using MigdalorDBContext db = new();
            db.OhNotices.Add(ohNotice);
            db.SaveChanges();

            return ohNotice;
        }

        public static List<OhNotice> GetOhNoticesByCategory(string category)
        {
            using MigdalorDBContext db = new();
            var res = db.OhNotices.Where(n => n.NoticeCategory == category).ToList();
            if (res.Count == 0)
            {
                throw new Exception("No notices found for this category");
            }
            return res;
        }
    }
}
