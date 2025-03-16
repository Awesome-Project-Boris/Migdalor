using Microsoft.Data.SqlClient;
namespace MigdalorServer.BL
{
    public class Category
    {
        private string categoryName;

        public Category() { }
        public Category(string categoryName)
        {
            CategoryName = categoryName;
        }

        public string CategoryName { get => categoryName; set => categoryName = value; }
    }
}
