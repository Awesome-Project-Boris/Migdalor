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
            // --- !! Add Logging !! ---
            Console.WriteLine("[AddOhNotice] Method Entry. Received Title: " + notice?.Title);
            var ohNotice = new OhNotice
            {
                NoticeTitle = notice.Title,
                NoticeMessage = notice.Content,
                SenderId = notice.SenderId,
                NoticeCategory = notice.Category,
                NoticeSubCategory = notice.SubCategory,
                CreationDate = DateTime.UtcNow // Explicitly set date
            };
            Console.WriteLine("[AddOhNotice] Mapped DTO to OhNotice entity.");

            try
            {
                using MigdalorDBContext db = new();
                Console.WriteLine("[AddOhNotice] Created new DbContext instance.");

                db.OhNotices.Add(ohNotice);
                Console.WriteLine("[AddOhNotice] Added entity to DbContext.");

                Console.WriteLine("[AddOhNotice] Calling SaveChanges...");
                db.SaveChanges(); // --- The likely point of failure ---
                Console.WriteLine($"[AddOhNotice] SaveChanges SUCCEEDED. New NoticeID: {ohNotice.NoticeId}");

                return ohNotice;
            }
            catch (Exception dbEx)
            {
                // --- !! Log the specific DB/SaveChanges exception !! ---
                Console.WriteLine("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                Console.WriteLine("[AddOhNotice] EXCEPTION during Add/SaveChanges:");
                Console.WriteLine(dbEx.ToString()); // Log the FULL exception details + stack trace
                Console.WriteLine("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                // --- End Logging ---
                throw; // Re-throw so the controller's catch block (and logger) can see it
            }
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
