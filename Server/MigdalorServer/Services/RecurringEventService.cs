using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using Ical.Net.DataTypes;
using System.Linq; // Required for LINQ's TakeWhile method

namespace MigdalorServer.Services
{
    /// <summary>
    /// A background service that runs daily to generate future instances for indefinitely recurring events.
    /// </summary>
    public class RecurringEventService : IHostedService, IDisposable
    {
        private Timer? _timer;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<RecurringEventService> _logger;

        public RecurringEventService(
            IServiceProvider serviceProvider,
            ILogger<RecurringEventService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Recurring Event Service is starting.");

            var now = DateTime.Now;
            var nextRunTime = DateTime.Today.AddDays(1).AddHours(1); // Next day at 1 AM
            var initialDelay = nextRunTime > now ? nextRunTime - now : TimeSpan.FromHours(1);

            _logger.LogInformation("Next recurring event generation will run at: {runTime}", DateTime.Now + initialDelay);
            _timer = new Timer(DoWork, null, initialDelay, TimeSpan.FromHours(24));

            return Task.CompletedTask;
        }

        private async void DoWork(object? state)
        {
            _logger.LogInformation("Recurring Event Service is running.");

            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<MigdalorDBContext>();
                try
                {
                    var indefiniteEvents = await dbContext.OhEvents
                        .Where(e => e.IsRecurring && e.EndDate == null && e.RecurrenceRule != null)
                        .Include(e => e.OhEventInstances)
                        .ToListAsync();

                    foreach (var eventToProcess in indefiniteEvents)
                    {
                        var lastInstance = eventToProcess.OhEventInstances.OrderByDescending(i => i.StartTime).FirstOrDefault();

                        if (lastInstance == null || lastInstance.StartTime < DateTime.UtcNow.AddMonths(1))
                        {
                            _logger.LogInformation("Generating new instances for event: {EventName}", eventToProcess.EventName);

                            var calendarEvent = new CalendarEvent
                            {
                                Start = new CalDateTime(eventToProcess.StartDate, "UTC"),
                                // This constructor is correct for your library version
                                Duration = new Duration(hours: 1),
                            };

                            calendarEvent.RecurrenceRules.Add(new RecurrencePattern(eventToProcess.RecurrenceRule));

                            var generationStartDate = lastInstance?.StartTime.ToUniversalTime() ?? eventToProcess.StartDate.ToUniversalTime();
                            var generationEndDate = DateTime.UtcNow.AddMonths(3);

                            // ✅ FINAL FIX: Get the infinite list of occurrences and use LINQ to filter it.
                            // This avoids all the version-specific problems we've encountered.
                            var occurrences = calendarEvent
                                .GetOccurrences(new CalDateTime(generationStartDate))
                                .TakeWhile(o => o.Period.StartTime.AsUtc < generationEndDate);

                            var newInstances = new List<OhEventInstance>();
                            foreach (var occurrence in occurrences)
                            {
                                // The TakeWhile makes this check redundant, but it's safe to keep.
                                // The very first item is skipped to avoid duplicates.
                                if (occurrence.Period.StartTime.AsUtc == generationStartDate) continue;

                                newInstances.Add(new OhEventInstance
                                {
                                    EventId = eventToProcess.EventId,
                                    StartTime = occurrence.Period.StartTime.AsUtc,
                                    EndTime = occurrence.Period.EndTime.AsUtc,
                                    Status = "Scheduled"
                                });
                            }

                            if (newInstances.Any())
                            {
                                dbContext.OhEventInstances.AddRange(newInstances);
                                _logger.LogInformation("Added {Count} new instances for event: {EventName}", newInstances.Count, eventToProcess.EventName);
                            }
                        }
                    }

                    await dbContext.SaveChangesAsync();
                    _logger.LogInformation("Recurring Event Service finished its work successfully.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred within the Recurring Event Service.");
                }
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Recurring Event Service is stopping.");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}