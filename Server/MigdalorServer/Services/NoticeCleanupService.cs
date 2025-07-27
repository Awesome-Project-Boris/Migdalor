using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;

namespace MigdalorServer.Services
{
    /// <summary>
    /// A background service that runs once a day to clean up old notices.
    /// Notices older than 7 days, and their associated pictures, are deleted.
    /// </summary>
    public class NoticeCleanupService : IHostedService, IDisposable
    {
        private Timer? _timer;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<NoticeCleanupService> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public NoticeCleanupService(
            IServiceProvider serviceProvider,
            ILogger<NoticeCleanupService> logger,
            IWebHostEnvironment hostingEnvironment)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
        }

        // NORMAL OPERATIONS

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Notice Cleanup Service is starting.");

            // Schedule the task to run at the next midnight, and then every 24 hours.
            var now = DateTime.Now;
            var nextRunTime = DateTime.Today.AddDays(1); // Next midnight
            var initialDelay = nextRunTime - now;

            _logger.LogInformation("Next notice cleanup will run at: {runTime}", nextRunTime);
            _timer = new Timer(DoWork, null, initialDelay, TimeSpan.FromHours(24));

            return Task.CompletedTask;
        }

        // TESTING

        // In your service file (e.g., NoticeCleanupService.cs)

        //public Task StartAsync(CancellationToken cancellationToken)
        //{
        //    _logger.LogInformation("Notice Cleanup Service is starting for TESTING.");

        //    const int TargetHour = 15;
        //    const int TargetMinute = 0;

        //    var now = DateTime.Now;
        //    var nextRunTime = DateTime.Today.AddHours(TargetHour).AddMinutes(TargetMinute);

        //    // If it's already past 15:00 today, schedule it for tomorrow.
        //    if (now > nextRunTime)
        //    {
        //        nextRunTime = nextRunTime.AddDays(1);
        //    }

        //    var initialDelay = nextRunTime - now;

        //    _logger.LogInformation("Next notice cleanup will run at: {runTime}", nextRunTime);
        //    _timer = new Timer(DoWork, null, initialDelay, TimeSpan.FromHours(24));

        //    return Task.CompletedTask;
        //}

        private async void DoWork(object? state)
        {
            _logger.LogInformation("Notice Cleanup Service is running.");

            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<MigdalorDBContext>();
                try
                {
                    // Step 1: Calculate the cutoff date (7 days ago).
                    var cutoffDate = DateTime.UtcNow.AddDays(-7);

                    // Step 2: Find all notices older than the cutoff date.
                    var noticesToDelete = await dbContext.OhNotices
                        .Where(n => n.CreationDate.HasValue && n.CreationDate.Value < cutoffDate)
                        .ToListAsync();

                    if (noticesToDelete.Any())
                    {
                        _logger.LogInformation("Found {count} notices older than 7 days to delete.", noticesToDelete.Count);

                        // Step 3: Find all picture records associated with these notices.
                        var pictureIdsToDelete = noticesToDelete
                            .Where(n => n.PictureId.HasValue)
                            .Select(n => n.PictureId.Value)
                            .ToList();

                        var picturesToDelete = await dbContext.OhPictures
                            .Where(p => pictureIdsToDelete.Contains(p.PicId))
                            .ToListAsync();

                        // Step 4: Loop through and delete the physical files from the disk.
                        foreach (var picture in picturesToDelete)
                        {
                            try
                            { 
                                // e.g., from "/Images/some-file.jpeg", this extracts "some-file.jpeg"
                                var fileName = Path.GetFileName(picture.PicPath);

                                var fullPath = Path.Combine(_hostingEnvironment.ContentRootPath, "uploadedFiles", fileName);

                                if (File.Exists(fullPath))
                                {
                                    File.Delete(fullPath);
                                    _logger.LogInformation("Successfully deleted physical file: {filePath}", fullPath);
                                }
                                else
                                {
                                    _logger.LogWarning("Physical file not found for picture record (PicId: {picId}), skipping deletion: {filePath}", picture.PicId, fullPath);
                                }
                            }
                            catch (Exception fileEx)
                            {
                                _logger.LogError(fileEx, "Error deleting physical file for picture record (PicId: {picId})", picture.PicId);
                            }
                        }

                        // Step 5: Remove the picture and notice records from the database.
                        if (picturesToDelete.Any())
                        {
                            dbContext.OhPictures.RemoveRange(picturesToDelete);
                        }
                        dbContext.OhNotices.RemoveRange(noticesToDelete);

                        await dbContext.SaveChangesAsync();
                        _logger.LogInformation("Successfully deleted old notices and their associated pictures from the database.");
                    }
                    else
                    {
                        _logger.LogInformation("No old notices found to delete.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred within the Notice Cleanup Service.");
                }
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Notice Cleanup Service is stopping.");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}