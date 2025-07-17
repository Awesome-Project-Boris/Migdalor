using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ical.Net;
using Ical.Net.CalendarComponents;
using Ical.Net.DataTypes;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Models
{
    public partial class OhEvent
    {
        public static async Task<List<EventDto>> GetEventsAsync(bool isRecurring)
        {
            using var db = new MigdalorDBContext();
            return await db
                .OhEvents.AsNoTracking()
                .Where(e => e.IsRecurring == isRecurring)
                .Include(e => e.Host) // Corrected: Using the 'Host' navigation property
                .Select(e => new EventDto
                {
                    Id = e.EventId, // Corrected property
                    Title = e.EventName, // Corrected property
                    Description = e.Description,
                    HostName =
                        e.Host != null ? e.Host.HebFirstName + " " + e.Host.HebLastName : "N/A",
                    Location = e.Location,
                    Capacity = e.Capacity,
                    IsRecurring = e.IsRecurring,
                    Rrule = e.RecurrenceRule, // Corrected property
                    Start = e.StartDate, // Corrected property
                    End = e.EndDate, // Corrected property
                })
                .OrderByDescending(e => e.Start)
                .ToListAsync();
        }

        public static async Task<OhEvent> AddEventAsync(CreateEventDto dto)
        {
            using var db = new MigdalorDBContext();
            var newEvent = new OhEvent
            {
                EventName = dto.EventName,
                Description = dto.Description,
                HostId = dto.HostID,
                Location = dto.Location,
                Capacity = dto.Capacity,
                IsRecurring = dto.IsRecurring,
                RecurrenceRule = dto.RecurrenceRule,
                StartDate = dto.StartDate,
                EndDate = dto.IsRecurring ? dto.EndDate : dto.StartDate,
            };
            db.OhEvents.Add(newEvent);
            await db.SaveChangesAsync();
            GenerateInstancesForEvent(newEvent, db);
            await db.SaveChangesAsync();
            return newEvent;
        }

        public static async Task<OhEvent> UpdateEventAsync(int eventId, CreateEventDto dto)
        {
            using var db = new MigdalorDBContext();
            var existingEvent = await db
                .OhEvents.Include(e => e.OhEventInstances)
                .FirstOrDefaultAsync(e => e.EventId == eventId);
            if (existingEvent == null)
            {
                throw new ArgumentException("Event not found.");
            }
            var originalRule = existingEvent.RecurrenceRule;
            var originalStartDate = existingEvent.StartDate;
            var originalEndDate = existingEvent.EndDate;
            existingEvent.EventName = dto.EventName;
            existingEvent.Description = dto.Description;
            existingEvent.Location = dto.Location;
            existingEvent.IsRecurring = dto.IsRecurring;
            existingEvent.RecurrenceRule = dto.RecurrenceRule;
            existingEvent.StartDate = dto.StartDate;
            existingEvent.EndDate = dto.IsRecurring ? dto.EndDate : dto.StartDate;
            if (
                originalRule != existingEvent.RecurrenceRule
                || originalStartDate != existingEvent.StartDate
                || originalEndDate != existingEvent.EndDate
            )
            {
                var futureInstances = existingEvent.OhEventInstances.Where(i =>
                    i.StartTime >= DateTime.UtcNow
                );
                db.OhEventInstances.RemoveRange(futureInstances);
                GenerateInstancesForEvent(existingEvent, db);
            }
            await db.SaveChangesAsync();
            return existingEvent;
        }

        public static async Task DeleteEventAsync(int eventId)
        {
            using var db = new MigdalorDBContext();
            var eventToDelete = await db.OhEvents.FindAsync(eventId);
            if (eventToDelete == null)
            {
                throw new ArgumentException("Event not found.");
            }
            db.OhEvents.Remove(eventToDelete);
            await db.SaveChangesAsync();
        }

        private static void GenerateInstancesForEvent(OhEvent anEvent, MigdalorDBContext db)
        {
            var duration = TimeSpan.FromHours(1);
            if (!anEvent.IsRecurring || string.IsNullOrEmpty(anEvent.RecurrenceRule))
            {
                db.OhEventInstances.Add(
                    new OhEventInstance
                    {
                        EventId = anEvent.EventId,
                        StartTime = anEvent.StartDate,
                        EndTime = anEvent.StartDate.Add(duration),
                    }
                );
            }
            else
            {
                try
                {
                    var calendarEvent = new CalendarEvent
                    {
                        Start = new CalDateTime(anEvent.StartDate),
                        Duration = new Duration(duration), // Corrected: new Duration(TimeSpan)
                        RecurrenceRules = new List<RecurrencePattern>
                        {
                            new RecurrencePattern(anEvent.RecurrenceRule),
                        },
                    };
                    var searchStart = new CalDateTime(anEvent.StartDate);
                    var searchEnd = new CalDateTime(
                        anEvent.EndDate ?? anEvent.StartDate.AddYears(1)
                    );

                    // Corrected: GetOccurrences now takes a search range
                    var occurrences = calendarEvent.GetOccurrences(searchStart, searchEnd);

                    foreach (var occurrence in occurrences)
                    {
                        db.OhEventInstances.Add(
                            new OhEventInstance
                            {
                                EventId = anEvent.EventId,
                                StartTime = occurrence.Period.StartTime.AsUtc,
                                EndTime = occurrence.Period.EndTime.AsUtc,
                                Status = "Scheduled",
                            }
                        );
                    }
                }
                catch (Exception)
                {
                    db.OhEventInstances.Add(
                        new OhEventInstance
                        {
                            EventId = anEvent.EventId,
                            StartTime = anEvent.StartDate,
                            EndTime = anEvent.StartDate.Add(duration),
                            Status = "Scheduled",
                            Notes = "Could not parse recurrence rule.",
                        }
                    );
                }
            }
        }
    }
}
