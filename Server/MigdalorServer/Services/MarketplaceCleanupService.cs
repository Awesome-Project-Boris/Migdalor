// In a new file, e.g., Services/MarketplaceCleanupService.cs

using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;

namespace MigdalorServer.Services
{
    /// <summary>
    /// A background service that runs once a day to clean up old marketplace listings.
    /// Listings older than 14 days, and their associated pictures, are deleted.
    /// </summary>
    public class MarketplaceCleanupService : IHostedService, IDisposable
    {
        private Timer? _timer;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MarketplaceCleanupService> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public MarketplaceCleanupService(
            IServiceProvider serviceProvider,
        ILogger<MarketplaceCleanupService> logger,
        IWebHostEnvironment hostingEnvironment)


        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
        }


        // NORMAL

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Marketplace Cleanup Service is starting.");

            // Schedule the task to run at the next midnight, and then every 24 hours.
            var now = DateTime.Now;
            var nextRunTime = DateTime.Today.AddDays(1); // Next midnight
            var initialDelay = nextRunTime - now;

            _logger.LogInformation("Next marketplace cleanup will run at: {runTime}", nextRunTime);
            _timer = new Timer(DoWork, null, initialDelay, TimeSpan.FromHours(24));

            return Task.CompletedTask;
        }

        // TESTING


        //public Task StartAsync(CancellationToken cancellationToken)
        //{
        //    _logger.LogInformation("Marketplace Cleanup Service is starting for TESTING.");

        //    const int TargetHour = 16;
        //    const int TargetMinute = 00;

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
            _logger.LogInformation("Marketplace Cleanup Service is running.");

            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<MigdalorDBContext>();
                try
                {
                    var cutoffDate = DateTime.UtcNow.AddDays(-14); // every 2 weeks 

                    var listingsToDelete = await dbContext.OhListings
                        .Where(l => l.Date < cutoffDate)
                        .ToListAsync();

                    if (listingsToDelete.Any())
                    {
                        _logger.LogInformation("Found {count} marketplace listings older than 2 weeks to delete.", listingsToDelete.Count);

                        // Step 1: Find all picture records associated with these listings BEFORE deleting them.
                        var listingIdsToDelete = listingsToDelete.Select(l => l.ListingId).ToList();
                        var picturesToDelete = await dbContext.OhPictures
                            .Where(p => p.ListingId.HasValue && listingIdsToDelete.Contains(p.ListingId.Value))
                            .ToListAsync();

                        // Step 2: Loop through and delete the physical files from the disk.
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

                        // Step 3: Now, remove the listing records from the database.
                        // The 'ON DELETE CASCADE' will handle removing the picture records automatically.
                        dbContext.OhListings.RemoveRange(listingsToDelete);
                        await dbContext.SaveChangesAsync();
                        _logger.LogInformation("Successfully deleted old listings and their database picture records.");
                    }
                    else
                    {
                        _logger.LogInformation("No old marketplace listings found to delete.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred within the Marketplace Cleanup Service.");
                }
            }
        }
        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Marketplace Cleanup Service is stopping.");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}