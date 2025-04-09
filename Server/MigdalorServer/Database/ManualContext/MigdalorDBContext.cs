using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace MigdalorServer.Database
{
    public partial class MigdalorDBContext : DbContext
    {
        public MigdalorDBContext() { }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            IConfiguration config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();
            optionsBuilder.UseSqlServer(config.GetConnectionString("myProjDB"));
        }
    }
}
