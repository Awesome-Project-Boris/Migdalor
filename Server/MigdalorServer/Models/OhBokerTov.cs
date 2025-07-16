using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Models
{
    public partial class OhBokerTov
    {
        /// <summary>
        /// Asynchronously generates a "Boker Tov" attendance report for a specified date range.
        /// </summary>
        /// <param name="startDate">The start date of the report period.</param>
        /// <param name="endDate">The end date of the report period.</param>
        /// <returns>A collection of BokerTovReportDto objects representing the report data.</returns>
        public static async Task<IEnumerable<BokerTovReportDto>> GetBokerTovReportAsync(
            DateTime startDate,
            DateTime endDate
        )
        {
            using var dbContext = new MigdalorDBContext();

            // Ensure the end date includes the entire day for an inclusive search
            var inclusiveEndDate = endDate.Date.AddDays(1).AddTicks(-1);

            var reportData = await dbContext
                .OhBokerTovs.AsNoTracking()
                .Where(bt =>
                    bt.AttendanceDate >= startDate.Date && bt.AttendanceDate <= inclusiveEndDate
                )
                .Include(bt => bt.Resident)
                .ThenInclude(r => r.Resident) // Corrected navigation property name to match OhResident -> OhPerson
                .Select(bt => new BokerTovReportDto
                {
                    ResidentName =
                        bt.Resident.Resident.HebFirstName + " " + bt.Resident.Resident.HebLastName,
                    PhoneNumber = bt.Resident.Resident.PhoneNumber,
                    HasSignedIn = bt.HasSignedIn,
                    SignInTime = bt.SignInTime,
                    AttendanceDate = bt.AttendanceDate,
                })
                .OrderBy(r => r.AttendanceDate)
                .ThenBy(r => r.ResidentName)
                .ToListAsync();

            return reportData;
        }
    }
}
