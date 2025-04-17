using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;

namespace MigdalorServer.Models
{
    public partial class OhCategory
    {
        public static List<OhCategory> GetAllCategories()
        {
            using MigdalorDBContext db = new MigdalorDBContext();
            return db.OhCategories.ToList();
        }

        public static OhCategory? GetCategoryByName(string name)
        {
            using MigdalorDBContext db = new MigdalorDBContext();
            return db.OhCategories.FirstOrDefault(c => c.CategoryName == name);
        }
    }
}
