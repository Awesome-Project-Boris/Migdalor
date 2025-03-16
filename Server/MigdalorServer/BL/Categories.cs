namespace MigdalorServer.BL
{
    public class Categories
    {
        private string categoryName;

        public Categories(string categoryName)
        {
            CategoryName = categoryName;
        }

        public string CategoryName { get => categoryName; set => categoryName = value; }
    }
}
