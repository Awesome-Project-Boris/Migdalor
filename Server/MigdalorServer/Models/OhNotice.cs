using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models.DTOs;
using System.Collections.Generic;
using System.Linq;
using System;

namespace MigdalorServer.Models
{
    public partial class OhNotice
    {
        /// <summary>
        /// Gets all notices, joining with the OH_People table to return the sender's full name
        /// in both Hebrew and English.
        /// </summary>
        /// <returns>A list of notices with sender names.</returns>
        public static List<dynamic> GetNotices()
        {
            using MigdalorDBContext db = new();

            // The query now joins OhNotices with OhPeople (via the Sender navigation property)
            // to retrieve the sender's names.
            var noticesWithSenders = db.OhNotices
                .Include(n => n.Sender) // Eagerly load the related OhPerson entity (performs a JOIN)
                .Include(n => n.NoticeCategoryNavigation)
                .OrderByDescending(n => n.CreationDate)
                .Select(n => new
                {
                    n.NoticeId,
                    // Hebrew name from the joined OH_People table.
                    HebSenderName = n.Sender != null ? n.Sender.HebFirstName + " " + n.Sender.HebLastName : "שולח לא ידוע",
                    // English name from the joined OH_People table. Handles potential nulls.
                    EngSenderName = n.Sender != null ? (n.Sender.EngFirstName + " " + n.Sender.EngLastName).Trim() : "Unknown Sender",
                    n.CreationDate,
                    n.NoticeTitle,
                    n.NoticeMessage,
                    n.NoticeCategory,
                    n.NoticeSubCategory,
                    // Safely access the category color, handling potential nulls.
                    CategoryColor = n.NoticeCategoryNavigation != null ? n.NoticeCategoryNavigation.CategoryColor : null
                })
                .ToList<dynamic>();

            return noticesWithSenders;
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

                db.OhNotices.Add(ohNotice);

                db.SaveChanges();


                return ohNotice;
            }
            catch (Exception dbEx)
            {

                Console.WriteLine(dbEx.ToString());

                throw;
            }
        }

        /// <summary>
        /// Gets all notices for a specific category, joining with the OH_People table to return the sender's full name
        /// in both Hebrew and English.
        /// </summary>
        /// <param name="category">The category to filter by.</param>
        /// <returns>A list of notices for the specified category with sender names.</returns>
        public static List<dynamic> GetOhNoticesByCategory(string category)
        {
            using MigdalorDBContext db = new();
            var res = db.OhNotices
                .Include(n => n.Sender) // Eagerly load the related OhPerson entity (performs a JOIN)
                .Include(n => n.NoticeCategoryNavigation)
                .Where(n => n.NoticeCategory == category) // Filter by the provided category
                .OrderByDescending(n => n.CreationDate)
                .Select(n => new
                {
                    n.NoticeId,
                    // Hebrew name from the joined OH_People table.
                    HebSenderName = n.Sender != null ? n.Sender.HebFirstName + " " + n.Sender.HebLastName : "שולח לא ידוע",
                    // English name from the joined OH_People table. Handles potential nulls.
                    EngSenderName = n.Sender != null ? (n.Sender.EngFirstName + " " + n.Sender.EngLastName).Trim() : "Unknown Sender",
                    n.CreationDate,
                    n.NoticeTitle,
                    n.NoticeMessage,
                    n.NoticeCategory,
                    n.NoticeSubCategory,
                    // Safely access the category color, handling potential nulls.
                    CategoryColor = n.NoticeCategoryNavigation != null ? n.NoticeCategoryNavigation.CategoryColor : null
                })
                .ToList<dynamic>();

            if (res.Count == 0)
            {
                throw new Exception("No notices found for this category");
            }
            return res;
        }
    }
}
