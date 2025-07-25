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

        public MarketplaceCleanupService(
            IServiceProvider serviceProvider,
            ILogger<MarketplaceCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

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

        private async void DoWork(object? state)
        {
            _logger.LogInformation("Marketplace Cleanup Service is running.");

            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<MigdalorDBContext>();
                try
                {
                    // Step 1: Calculate the cutoff date (7 days ago).
                    // We use UtcNow for consistency with the database default for the listing Date.
                    var cutoffDate = DateTime.UtcNow.AddDays(-14);

                    // Step 2: Find all listings older than the cutoff date.
                    var listingsToDelete = await dbContext.OhListings
                        .Where(l => l.Date < cutoffDate)
                        .ToListAsync();

                    if (listingsToDelete.Any())
                    {
                        _logger.LogInformation("Found {count} marketplace listings older than 7 days to delete.", listingsToDelete.Count);

                        // Step 3: Remove the listings.
                        // EF Core will issue DELETE commands for these listings.
                        // The ON DELETE CASCADE rule in your database will automatically delete the associated pictures.
                        dbContext.OhListings.RemoveRange(listingsToDelete);

                        await dbContext.SaveChangesAsync();
                        _logger.LogInformation("Successfully deleted old listings and their associated pictures.");
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