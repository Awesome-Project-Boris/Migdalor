using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace MigdalorServer.Models
{
    public class OhInterests
    {

        public static async Task<List<string>> GetAllInterestNamesAsync(MigdalorDBContext context)
        {
            if (context.OhInterests == null)
            {
                return new List<string>();
            }

            return await context.OhInterests
                                .Select(i => i.InterestName)
                                .OrderBy(name => name) // It's good practice to return a sorted list
                                .ToListAsync();
        }
    }
}
