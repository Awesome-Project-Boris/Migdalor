using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Models
{
    public partial class OhNotice
    {
        public static List<dynamic> GetNotices()
        {
            using MigdalorDBContext db = new();
            return db
                .OhNotices.Include(n => n.NoticeCategoryNavigation)
                .Select(n => new
                {
                    n.NoticeId,
                    n.SenderId,
                    n.CreationDate,
                    n.NoticeTitle,
                    n.NoticeMessage,
                    n.NoticeCategory,
                    n.NoticeSubCategory,
                    n.NoticeCategoryNavigation!.CategoryColor,
                })
                .OrderByDescending(n => n.CreationDate)
                .ToList<dynamic>();
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

        public static List<dynamic> GetOhNoticesByCategory(string category)
        {
            using MigdalorDBContext db = new();
            var res = db
                .OhNotices.Include(n => n.NoticeCategoryNavigation)
                .Select(n => new
                {
                    n.NoticeId,
                    n.SenderId,
                    n.CreationDate,
                    n.NoticeTitle,
                    n.NoticeMessage,
                    n.NoticeCategory,
                    n.NoticeSubCategory,
                    n.NoticeCategoryNavigation!.CategoryColor,
                })
                .Where(n => n.NoticeCategory == category)
                .ToList<dynamic>();

            if (res.Count == 0)
            {
                throw new Exception("No notices found for this category");
            }
            return res;
        }
    }
}
