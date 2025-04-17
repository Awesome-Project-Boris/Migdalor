using MigdalorServer.Database;

namespace MigdalorServer.Models
{
    public partial class OhNotice
    {
        public static List<OhNotice> GetOhNotices()
        {
            using MigdalorDBContext db = new MigdalorDBContext();
            return db.OhNotices.ToList();
        }

        public static void AddOhNotice(OhNotice ohNotice)
        {
            using MigdalorDBContext db = new MigdalorDBContext();
            db.OhNotices.Add(ohNotice);
            db.SaveChanges();
        }
    }
}
