using ClosedXML.Excel;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MigdalorServer.Database;
using MigdalorServer.Models;
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MigdalorServer.Services
{
    /// <summary>
    /// A background service that runs daily tasks at a scheduled time (4 AM).
    /// 1. Generates an Excel report for the previous day's attendance.
    /// 2. Prepares blank attendance records for the current day for all active residents.
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
        /// Called when the application starts. Schedules the timer.
        /// </summary>
        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Daily Tasks Service is starting.");

            var now = DateTime.Now;
            var nextRunTime = DateTime.Today.AddDays(1).AddHours(4); // Schedule for 4 AM tomorrow
            if (now.Hour < 4)
            {
                nextRunTime = DateTime.Today.AddHours(4); // If it's before 4 AM, schedule for today
            }

            var initialDelay = nextRunTime - now;

            _logger.LogInformation("Next daily task will run at: {runTime}", nextRunTime);
            _timer = new Timer(DoWork, null, initialDelay, TimeSpan.FromHours(24));

            return Task.CompletedTask;
        }

        /// <summary>
        /// The main work method called by the timer.
        /// </summary>
        private async void DoWork(object? state)
        {
            _logger.LogInformation("Daily Tasks Service is executing its work.");

            // Create a new dependency injection scope to resolve scoped services like DbContext
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<MigdalorDBContext>();
                try
                {
                    // Task 1: Generate and save the attendance report for the previous day.
                    await GenerateYesterdayReport(dbContext);

                    // Task 2: Prepare blank attendance records for the new day.
                    await PrepareTodayAttendance(dbContext);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "A critical error occurred within the Daily Tasks Service.");
                }
            }
        }

        /// <summary>
        /// Generates an Excel report from yesterday's attendance data and saves it to the server.
        /// </summary>
        private async Task GenerateYesterdayReport(MigdalorDBContext dbContext)
        {
            var yesterday = DateOnly.FromDateTime(DateTime.Now.AddDays(-1));
            _logger.LogInformation("Generating attendance report for {yesterday}", yesterday);

            var reportData = await dbContext.OhDailyAttendances
                .Where(a => a.AttendanceDate == yesterday)
                .Include(a => a.Resident!.Person) // Eager load related data to prevent N+1 queries
                .Select(a => new
                {
                    a.ResidentId,
                    FullName = a.Resident!.Person!.FirstName + " " + a.Resident.Person.LastName,
                    HasSignedIn = a.HasSignedIn ? "Yes" : "No",
                    SignInTime = a.SignInTime.HasValue ? a.SignInTime.Value.ToLocalTime().ToString("g") : "N/A"
                })
                .ToListAsync();

            if (!reportData.Any())
            {
                _logger.LogInformation("No attendance data found for {yesterday}. Skipping report generation.", yesterday);
                return;
            }

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add($"Attendance {yesterday:yyyy-MM-dd}");
                worksheet.Cell("A1").Value = "Resident ID";
                worksheet.Cell("B1").Value = "Full Name";
                worksheet.Cell("C1").Value = "Signed In?";
                worksheet.Cell("D1").Value = "Sign-In Time (Local)";

                worksheet.Row(1).Style.Font.Bold = true;
                worksheet.Cell("A2").InsertData(reportData);
                worksheet.Columns().AdjustToContents();

                // Build the path relative to the application's root directory
                var contentRootPath = _hostingEnvironment.ContentRootPath;
                var dailyAttendancePath = Path.Combine(contentRootPath, "Reports", "Daily Attendance");

                // Check if the pre-configured directory exists. Do NOT create it.
                if (!Directory.Exists(dailyAttendancePath))
                {
                    _logger.LogCritical("Report directory does not exist and will not be created. Please ensure the folder exists at: {path}", dailyAttendancePath);
                    return; // Stop the report generation process.
                }

                var filePath = Path.Combine(dailyAttendancePath, $"Daily_Attendance_{yesterday:yyyy-MM-dd}.xlsx");

                workbook.SaveAs(filePath);
                _logger.LogInformation("Report saved successfully to {filePath}", filePath);
            }
        }

        /// <summary>
        /// Creates blank attendance records for the current day for any active resident who doesn't have one.
        /// </summary>
        private async Task PrepareTodayAttendance(MigdalorDBContext dbContext)
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            _logger.LogInformation("Preparing attendance records for {today}", today);

            // Find all active residents who do NOT already have an attendance record for today.
            // This prevents creating duplicate records if the service is run manually.
            var residentsWithoutRecord = await dbContext.OhResidents
                .Where(r => r.IsActive && !dbContext.OhDailyAttendances.Any(a => a.ResidentId == r.Id && a.AttendanceDate == today))
                .Select(r => r.Id)
                .ToListAsync();

            if (!residentsWithoutRecord.Any())
            {
                _logger.LogInformation("All active residents already have attendance records for today.");
                return;
            }

            var newAttendanceRecords = residentsWithoutRecord.Select(residentId => new OhDailyAttendance
            {
                ResidentId = residentId,
                AttendanceDate = today,
                HasSignedIn = false,
                SignInTime = null
            });

            await dbContext.OhDailyAttendances.AddRangeAsync(newAttendanceRecords);
            await dbContext.SaveChangesAsync();

            _logger.LogInformation("Created {count} new attendance records for today.", newAttendanceRecords.Count());
        }

        /// <summary>
        /// Called when the application is shutting down. Stops the timer.
        /// </summary>
        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Daily Tasks Service is stopping.");
            _timer?.Change(Timeout.Infinite, 0); // Stop the timer from firing again
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
