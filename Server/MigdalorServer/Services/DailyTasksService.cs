using ClosedXML.Excel;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MigdalorServer.Database;
using MigdalorServer.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MigdalorServer.Services
{
    /// <summary>
    /// A background service that runs daily tasks at a scheduled time.
    /// 1. Generates an Excel report from all existing attendance data.
    /// 2. Rolls over the existing data for the new day and adds any new residents.
    /// </summary>
    public class DailyTasksService : IHostedService, IDisposable
    {
        private Timer? _timer;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DailyTasksService> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public DailyTasksService(
            IServiceProvider serviceProvider,
            ILogger<DailyTasksService> logger,
            IWebHostEnvironment hostingEnvironment)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
        }

        /// <summary>
        /// Called when the application starts. Schedules the timer for the daily run.
        /// </summary>
        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Daily Tasks Service is starting.");

            const int TargetHour = 12;
            const int TargetMinute = 58;

            var now = DateTime.Now;
            var nextRunTime = DateTime.Today.AddHours(TargetHour).AddMinutes(TargetMinute);

            if (now > nextRunTime)
            {
                nextRunTime = nextRunTime.AddDays(1);
            }

            var initialDelay = nextRunTime - now;

            _logger.LogInformation("Next daily task will run at: {runTime}", nextRunTime);
            _timer = new Timer(DoWork, null, initialDelay, TimeSpan.FromHours(24));

            return Task.CompletedTask;
        }

        /// <summary>
        /// The main work method that performs the daily report and rollover process.
        /// </summary>
        private async void DoWork(object? state)
        {
            _logger.LogInformation("Daily Tasks Service is executing its work.");

            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<MigdalorDBContext>();
                try
                {
                    var recordsToProcess = await dbContext.OhBokerTovs.ToListAsync();

                    if (recordsToProcess.Any())
                    {
                        await GenerateReportFromData(recordsToProcess, dbContext);
                    }
                    else
                    {
                        _logger.LogInformation("No Boker Tov data found to report on. Skipping report generation.");
                    }

                    var today = DateTime.Now.Date;
                    foreach (var record in recordsToProcess)
                    {
                        record.AttendanceDate = today;
                        record.HasSignedIn = false;
                        record.SignInTime = null;
                    }
                    _logger.LogInformation("Rolled over {count} existing records for the new day.", recordsToProcess.Count);

                    var processedResidentIds = recordsToProcess.Select(r => r.ResidentId).ToHashSet();
                    var newResidents = await dbContext.OhResidents
                        .Where(r => r.IsActive == true && !processedResidentIds.Contains(r.ResidentId))
                        .Select(r => r.ResidentId)
                        .ToListAsync();

                    if (newResidents.Any())
                    {
                        var newRecords = newResidents.Select(residentId => new OhBokerTov
                        {
                            ResidentId = residentId,
                            AttendanceDate = today,
                            HasSignedIn = false,
                            SignInTime = null
                        });
                        await dbContext.OhBokerTovs.AddRangeAsync(newRecords);
                        _logger.LogInformation("Created {count} new Boker Tov records for new residents.", newRecords.Count());
                    }

                    await dbContext.SaveChangesAsync();
                    _logger.LogInformation("Boker Tov rollover process complete.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "A critical error occurred within the Daily Tasks Service.");
                }
            }
        }

        /// <summary>
        /// Generates an Excel report from a given list of attendance records.
        /// </summary>
        private async Task GenerateReportFromData(List<OhBokerTov> records, MigdalorDBContext dbContext)
        {
            var reportDate = DateTime.Now.AddDays(-1).Date;
            _logger.LogInformation("Generating Boker Tov report for date: {reportDate}", reportDate);

            var residentIds = records.Select(r => r.ResidentId).ToList();
            var personData = await (
                from resident in dbContext.OhResidents
                where residentIds.Contains(resident.ResidentId)
                join person in dbContext.OhPeople on resident.ResidentId equals person.PersonId
                select new { resident.ResidentId, FullName = string.Join(" ", person.HebFirstName, person.HebLastName), person.PhoneNumber }
            ).ToDictionaryAsync(p => p.ResidentId, p => new { p.FullName, p.PhoneNumber });

            var reportData = records.Select(r =>
            {
                var pData = personData.GetValueOrDefault(r.ResidentId);
                return new
                {
                    FullName = pData?.FullName ?? "Unknown Resident",
                    PhoneNumber = pData?.PhoneNumber ?? "N/A",
                    HasSignedIn = r.HasSignedIn ? "כן" : "לא",
                    SignInTime = r.HasSignedIn && r.SignInTime.HasValue ? r.SignInTime.Value.ToLocalTime().ToString("HH:mm") : "N/A"
                };
            }).ToList();

            using (var workbook = new XLWorkbook())
            {
                var reportDateFormatted = reportDate.ToString("dd-MM-yyyy");
                var worksheet = workbook.Worksheets.Add($"דוח בוקר טוב {reportDateFormatted}");

                worksheet.RightToLeft = true;

                // Insert the data as a formal Excel table
                var table = worksheet.Cell("A1").InsertTable(reportData);

                // Rename the headers of the newly created table
                table.Field(0).Name = "שם מלא";
                table.Field(1).Name = "מספר טלפון";
                table.Field(2).Name = "האם נרשם/ה";
                table.Field(3).Name = "זמן רישום";

                // Apply a style to the table (optional, but looks nice)
                table.Theme = XLTableTheme.TableStyleLight16;

                worksheet.Columns().AdjustToContents();

                int totalCount = records.Count;
                int signedInCount = records.Count(r => r.HasSignedIn);
                var summaryText = $"בתאריך {reportDateFormatted} נרשמו {signedInCount} מתוך {totalCount}";

                int lastRow = worksheet.LastRowUsed().RowNumber();
                var summaryCell = worksheet.Cell(lastRow + 2, 1);
                summaryCell.Value = summaryText;
                summaryCell.Style.Font.Bold = true;
                summaryCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                worksheet.Range(summaryCell, worksheet.Cell(lastRow + 2, 4)).Merge();


                var contentRootPath = _hostingEnvironment.ContentRootPath;
                var dailyAttendancePath = Path.Combine(contentRootPath, "Reports", "Daily Attendance");

                if (!Directory.Exists(dailyAttendancePath))
                {
                    _logger.LogCritical("Report directory does not exist. Please ensure the folder exists at: {path}", dailyAttendancePath);
                    return;
                }

                var filePath = Path.Combine(dailyAttendancePath, $"BokerTov_Report_{reportDateFormatted}.xlsx");
                workbook.SaveAs(filePath);
                _logger.LogInformation("Report saved successfully to {filePath}", filePath);
            }
        }

        /// <summary>
        /// Called when the application is shutting down. Stops the timer.
        /// </summary>
        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Daily Tasks Service is stopping.");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        /// <summary>
        /// Disposes the timer resource.
        /// </summary>
        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}


