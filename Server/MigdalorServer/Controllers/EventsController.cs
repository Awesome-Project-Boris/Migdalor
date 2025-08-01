﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;
using DocumentFormat.OpenXml.InkML;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly MigdalorDBContext _context;
        private readonly ILogger<NoticesController> _logger;

        public EventsController(MigdalorDBContext context, ILogger<NoticesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/events/all
        // EventsController.cs

        // GET: api/events/all
        // EventsController.cs

        // GET: api/events/all
        [HttpGet("all")]
        public async Task<ActionResult<object>> GetEvents()
        {
            var allEvents = await _context.OhEvents
                .AsNoTracking()
                .GroupJoin(
                    _context.OhPeople,
                    e => e.HostId,
                    p => p.PersonId,
                    (e, p_group) => new { e, p_group }
                )
                .SelectMany(
                    x => x.p_group.DefaultIfEmpty(),
                    (x, p) => new
                    {
                        x.e.EventId,
                        x.e.EventName,
                        HostId = x.e.HostId,
                        HostName = p != null ? p.HebFirstName + " " + p.HebLastName : "לא הוקצה", // Handle null host
                        x.e.Location,
                        x.e.StartDate,
                        x.e.IsRecurring,
                        x.e.RecurrenceRule,
                        x.e.Capacity,
                    }
                )
                .ToListAsync();

            var result = new
            {
                events = allEvents.Where(e => !e.IsRecurring),
                classes = allEvents.Where(e => e.IsRecurring),
            };

            return Ok(result);
        }

        // GET: api/events
        // Pulls all future Activities and ongoing Classes
        [HttpGet]
        public async Task<ActionResult<object>> GetActiveEvents()
        {
            try
            {
                var now = DateTime.UtcNow;

                var eventsQuery =
                    from e in _context.OhEvents
                    join pic in _context.OhPictures on e.PictureId equals pic.PicId into picGroup
                    from pg in picGroup.DefaultIfEmpty()
                    join h in _context.OhPeople on e.HostId equals h.PersonId into hostGroup
                    from host in hostGroup.DefaultIfEmpty()
                    where (e.IsRecurring == false && e.StartDate > now) ||
                          (e.IsRecurring == true && (e.EndDate == null || e.EndDate > now))
                    select new EventDto
                    {
                        EventId = e.EventId,
                        EventName = e.EventName,
                        Description = e.Description,
                        Location = e.Location,
                        PictureId = e.PictureId,
                        PicturePath = pg.PicPath,
                        IsRecurring = e.IsRecurring,
                        RecurrenceRule = e.RecurrenceRule,
                        DateCreated = e.DateCreated,
                        StartDate = e.StartDate,
                        EndDate = e.EndDate,
                        Capacity = e.Capacity,
                        ParticipantsCount = e.OhEventRegistrations.Count(),
                        HostName = host != null ? host.HebFirstName + " " + host.HebLastName : "N/A"
                    };

                var events = await eventsQuery.AsNoTracking().ToListAsync();

                var result = new
                {
                    Classes = events.Where(e => e.IsRecurring),
                    Activities = events.Where(e => !e.IsRecurring)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching events: {ex.Message}");
            }
        }

        // GET: api/events/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EventDetailDto>> GetEventById(int id)
        {
            try
            {
                var eventDetail = await (from e in _context.OhEvents
                                         join p in _context.OhPeople on e.HostId equals p.PersonId into hostGroup
                                         from h in hostGroup.DefaultIfEmpty()
                                         join pic in _context.OhPictures on e.PictureId equals pic.PicId into picGroup
                                         from pg in picGroup.DefaultIfEmpty()
                                         where e.EventId == id
                                         select new EventDetailDto
                                         {
                                             EventId = e.EventId,
                                             EventName = e.EventName,
                                             Description = e.Description,
                                             Location = e.Location,
                                             PictureId = e.PictureId,
                                             PicturePath = pg.PicPath,
                                             IsRecurring = e.IsRecurring,
                                             RecurrenceRule = e.RecurrenceRule,
                                             StartDate = e.StartDate,
                                             EndDate = e.EndDate,
                                             Capacity = e.Capacity,
                                             ParticipationChecked = e.ParticipationChecked,
                                             Host = h == null ? null : new HostDto
                                             {
                                                 HostId = h.PersonId,
                                                 EnglishName = h.PersonRole == "admin" ? "Administration" : h.EngFirstName + " " + h.EngLastName,
                                                 HebrewName = h.PersonRole == "admin" ? "הנהלה" : h.HebFirstName + " " + h.HebLastName,
                                                 Role = h.PersonRole
                                             }
                                         }).FirstOrDefaultAsync();

                if (eventDetail == null)
                {
                    return NotFound("Event not found.");
                }

                eventDetail.ParticipantsCount = await _context.OhEventRegistrations.CountAsync(r => r.EventId == id);

                return Ok(eventDetail);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching event details: {ex.Message}");
            }
        }

        // GET: api/events/{eventId}/participants
        [HttpGet("{eventId}/participants")]
        public async Task<ActionResult<IEnumerable<ParticipantDto>>> GetEventParticipants(int eventId)
        {
            try
            {
                var participants = await (from r in _context.OhEventRegistrations
                                          join p in _context.OhPeople on r.ParticipantId equals p.PersonId
                                          where r.EventId == eventId
                                          select new ParticipantDto
                                          {
                                              ParticipantId = r.ParticipantId,
                                              EnglishFullName = p.EngFirstName + " " + p.EngLastName,
                                              HebrewFullName = p.HebFirstName + " " + p.HebLastName,
                                              RegistrationStatus = r.Status
                                          }).ToListAsync();

                return Ok(participants);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching participants: {ex.Message}");
            }
        }

        // POST: api/events/attendance
        [HttpPost("attendance")]
        public async Task<IActionResult> UpdateAttendance([FromBody] UpdateParticipationDto attendanceDto)
        {
            try
            {
                var attendanceRecord = await _context.OhParticipations
                    .FirstOrDefaultAsync(a => a.EventId == attendanceDto.EventId && a.ParticipantId == attendanceDto.ParticipantId);

                if (attendanceRecord != null)
                {
                    attendanceRecord.Status = attendanceDto.Status;
                }
                else
                {
                    var newRecord = new OhParticipation
                    {
                        EventId = attendanceDto.EventId,
                        ParticipantId = attendanceDto.ParticipantId,
                        Status = attendanceDto.Status,
                        RegistrationTime = DateTime.UtcNow
                    };
                    _context.OhParticipations.Add(newRecord);
                }

                await _context.SaveChangesAsync();
                return Ok("Attendance updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error updating attendance: {ex.Message}");
            }
        }

        // GET: api/events/host/{hostId}

        // 5. GET: api/events/host/{hostId}
        // Pulls all events hosted by a specific person

        // OBSOLETE - Not all the details we want 


        [HttpGet("host/{hostId}")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEventsByHost(Guid hostId)
        {
            try
            {
                var events = await _context.OhEvents
                    .AsNoTracking()
                    .Where(e => e.HostId == hostId)
                    .Select(e => new EventDto
                    {
                        EventId = e.EventId,
                        EventName = e.EventName,
                        Description = e.Description,
                        Location = e.Location,
                        IsRecurring = e.IsRecurring,
                        StartDate = DateTime.SpecifyKind(e.StartDate, DateTimeKind.Utc),
                        EndDate = e.EndDate.HasValue ? DateTime.SpecifyKind(e.EndDate.Value, DateTimeKind.Utc) : null,
                        ParticipationChecked = e.ParticipationChecked,
                        Capacity = e.Capacity
                    })
                    .ToListAsync();

                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error fetching host's events: {ex.Message}");
            }
        }

        // POST: api/events/register
        [HttpPost("register")]
        public async Task<IActionResult> RegisterForEvent([FromBody] RegisterForEventDto registrationDto)
        {
            try
            {
                var eventToRegister = await _context.OhEvents.FindAsync(registrationDto.EventId);
                if (eventToRegister == null)
                {
                    return NotFound("Event not found.");
                }

                var registrations = await _context.OhEventRegistrations
                    .Where(r => r.EventId == registrationDto.EventId)
                    .ToListAsync();

                if (eventToRegister.Capacity.HasValue && registrations.Count >= eventToRegister.Capacity)
                {
                    return BadRequest("This activity is already full.");
                }

                bool isAlreadyRegistered = registrations.Any(r => r.ParticipantId == registrationDto.ParticipantId);
                if (isAlreadyRegistered)
                {
                    return BadRequest("You are already registered for this activity.");
                }

                var newRegistration = new OhEventRegistration
                {
                    EventId = registrationDto.EventId,
                    ParticipantId = registrationDto.ParticipantId,
                    Status = "Active",
                    RegistrationDate = DateTime.UtcNow
                };

                _context.OhEventRegistrations.Add(newRegistration);
                await _context.SaveChangesAsync();

                return Ok("Successfully registered for the activity.");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error during registration: {ex.Message}");
            }
        }

        // POST: api/events/CreateActivity
        [HttpPost("CreateActivity")]
        [Authorize]
        public async Task<IActionResult> CreateActivity([FromBody] NewActivityDto eventDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || eventDto.HostId.ToString() != userIdClaim)
            {
                return Forbid("You can only create events for yourself.");
            }

            var canInitiate = await _context.OhResidents
                                            .Where(r => r.ResidentId == eventDto.HostId)
                                            .Select(r => r.CanInitActivity)
                                            .FirstOrDefaultAsync();

            if (!canInitiate)
            {
                return Forbid("You do not have permission to initiate new activities.");
            }

            try
            {
                var eventNameExists = await _context.OhEvents.AnyAsync(e => e.EventName == eventDto.EventName);
                if (eventNameExists)
                {
                    return Conflict("An event with this name already exists. Please choose a different name.");
                }

                var israelTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Israel Standard Time");
                var israelStartDate = TimeZoneInfo.ConvertTimeFromUtc(eventDto.StartDate, israelTimeZone);

                var israelEndDate = TimeZoneInfo.ConvertTimeFromUtc(eventDto.EndDate, israelTimeZone);

                var newEvent = new OhEvent
                {
                    EventName = eventDto.EventName,
                    Description = eventDto.Description,
                    HostId = eventDto.HostId,
                    Location = eventDto.Location,
                    PictureId = eventDto.PictureId,
                    Capacity = eventDto.Capacity,
                    IsRecurring = false,
                    RecurrenceRule = null,
                    StartDate = israelStartDate,
                    EndDate = israelEndDate,
                    DateCreated = DateTime.UtcNow
                };

                _context.OhEvents.Add(newEvent);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetEventById), new { id = newEvent.EventId }, newEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An internal server error occurred while creating the event.");
            }
        }

        // GET: api/events/timetable
        [HttpGet("timetable")]
        public async Task<ActionResult<IEnumerable<TimetableEntryDto>>> GetTimetableEntries([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            if (startDate == default || endDate == default)
            {
                return BadRequest("Please provide both a startDate and an endDate.");
            }

            var allEntries = new List<TimetableEntryDto>();

            var oneTimeEvents = await _context.OhEvents
                .Where(e => !e.IsRecurring && e.StartDate >= startDate && e.StartDate <= endDate)
                .Select(e => new TimetableEntryDto
                {
                    Id = e.EventId,
                    Title = e.EventName,
                    Description = e.Description,
                    Location = e.Location,
                    StartTime = e.StartDate,
                    EndTime = e.EndDate ?? e.StartDate,
                    SourceTable = "OH_Events",
                    NavigationEventId = e.EventId,
                    Status = "Scheduled" // One-time events are always considered scheduled
                })
                .ToListAsync();
            allEntries.AddRange(oneTimeEvents);

            var eventInstances = await _context.OhEventInstances
                .Where(i => i.StartTime >= startDate && i.StartTime <= endDate)
                .Join(_context.OhEvents,
                      instance => instance.EventId,
                      parentEvent => parentEvent.EventId,
                      (instance, parentEvent) => new TimetableEntryDto
                      {
                          Id = instance.InstanceId,
                          Title = parentEvent.EventName,
                          Description = parentEvent.Description,
                          Location = parentEvent.Location,
                          StartTime = instance.StartTime,
                          EndTime = instance.EndTime,
                          SourceTable = "OH_EventInstances",
                          NavigationEventId = parentEvent.EventId,
                          Status = instance.Status, // Pass the status from the instance
                          Notes = instance.Notes    // Pass the notes from the instance
                      })
                .ToListAsync();
            allEntries.AddRange(eventInstances);

            var manualAdditions = await _context.OhTimeTableAdditions
                .Where(a => a.StartTime >= startDate && a.StartTime <= endDate)
                .Select(a => new TimetableEntryDto
                {
                    Id = a.Id,
                    Title = a.Name,
                    Description = a.Description,
                    Location = a.Location,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    SourceTable = "OH_TimeTableAdditions",
                    NavigationEventId = null,
                    Status = "Scheduled" // Manual additions are always considered scheduled
                })
                .ToListAsync();
            allEntries.AddRange(manualAdditions);

            return Ok(allEntries.OrderBy(e => e.StartTime));
        }

        // === ADMIN PANEL CRUD OPERATIONS ===

        // POST: api/events/admin
        [HttpPost("admin")]
        [Authorize(Roles = "admin")] // Example authorization
        public async Task<ActionResult<OhEvent>> CreateEventForAdmin([FromBody] AdminCreateEventDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newEvent = new OhEvent
            {
                EventName = createDto.EventName,
                Description = createDto.Description,
                HostId = createDto.HostId,
                Location = createDto.Location,
                Capacity = createDto.Capacity,
                IsRecurring = createDto.IsRecurring,
                RecurrenceRule = createDto.IsRecurring ? createDto.RecurrenceRule : null,
                StartDate = createDto.StartDate,
                EndDate = createDto.EndDate,
                PictureId = createDto.PictureId, // Add this line
                ParticipationChecked = false,
                DateCreated = DateTime.UtcNow
            };

            _context.OhEvents.Add(newEvent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEventById), new { id = newEvent.EventId }, newEvent);
        }

        // PUT: api/events/admin/{id}
        [HttpPut("admin/{id}")]
        [Authorize(Roles = "admin")] // Example authorization
        public async Task<IActionResult> UpdateEventForAdmin(int id, [FromBody] AdminUpdateEventDto updateDto)
        {
            var eventToUpdate = await _context.OhEvents.FindAsync(id);

            if (eventToUpdate == null)
            {
                return NotFound();
            }

            eventToUpdate.EventName = updateDto.EventName;
            eventToUpdate.Description = updateDto.Description;
            eventToUpdate.HostId = updateDto.HostId;
            eventToUpdate.Location = updateDto.Location;
            eventToUpdate.Capacity = updateDto.Capacity;
            eventToUpdate.IsRecurring = updateDto.IsRecurring;
            eventToUpdate.RecurrenceRule = updateDto.IsRecurring ? updateDto.RecurrenceRule : null;
            eventToUpdate.StartDate = updateDto.StartDate;
            eventToUpdate.EndDate = updateDto.EndDate;
            eventToUpdate.PictureId = updateDto.PictureId; // Add this line

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.OhEvents.Any(e => e.EventId == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/events/admin/{id}
        [HttpDelete("admin/{id}")]
        [Authorize(Roles = "admin")] // Example authorization
        public async Task<IActionResult> DeleteEventForAdmin(int id)
        {
            var ohEvent = await _context.OhEvents.FindAsync(id);
            if (ohEvent == null)
            {
                return NotFound();
            }

            // Before deleting the event, remove related registrations to avoid foreign key conflicts.
            var registrations = _context.OhEventRegistrations.Where(r => r.EventId == id);
            _context.OhEventRegistrations.RemoveRange(registrations);

            var participations = _context.OhParticipations.Where(p => p.EventId == id);
            _context.OhParticipations.RemoveRange(participations);

            _context.OhEvents.Remove(ohEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Instead of Host/id - here we get more data relevant for events specificially - no time limits
        // Especially for administrative purposes

        // In EventsController.cs

        [HttpGet("creator/{creatorId}")]
        public async Task<IActionResult> GetEventsByCreator(Guid creatorId)
        {
            try
            {
                var query = from e in _context.OhEvents
                            join pic in _context.OhPictures on e.PictureId equals pic.PicId into picGroup
                            from pg in picGroup.DefaultIfEmpty()
                            where e.HostId == creatorId && !e.IsRecurring
                            orderby e.StartDate descending
                            select new EventDto
                            {
                                EventId = e.EventId,
                                EventName = e.EventName,
                                Description = e.Description,
                                Location = e.Location,
                                IsRecurring = e.IsRecurring,
                                PictureId = e.PictureId,
                                PicturePath = pg.PicPath,
                                StartDate = e.StartDate,
                                EndDate = e.EndDate,
                                Capacity = e.Capacity, // Also good to include this
                                ParticipationChecked = e.ParticipationChecked,
                                ParticipantsCount = e.OhEventRegistrations.Count()
                            };

                var userEvents = await query.AsNoTracking().ToListAsync();

                return Ok(userEvents ?? new List<EventDto>());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("latest-timestamp")]
        public async Task<ActionResult<DateTime>> GetLatestEventTimestamp()
        {
            try
            {
                var latestCreationDate = await _context.OhEvents
                    .OrderByDescending(e => e.DateCreated)
                    .Select(e => e.DateCreated)
                    .FirstOrDefaultAsync();

                if (latestCreationDate == default)
                {
                    return NotFound("No events found.");
                }

                // --- FIX: Specify that the DateTime from the DB should be treated as UTC ---
                var utcDate = DateTime.SpecifyKind(latestCreationDate, DateTimeKind.Utc);

                return Ok(utcDate);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching latest event timestamp: {ex.Message}");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("{eventId}/mark-checked")]
        [Authorize] // Ensures only a logged-in user can call this
        public async Task<IActionResult> ToggleParticipationChecked(int eventId)
        {
            // Step 1: Get the ID of the user making the request from their token.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized("Invalid user token.");
            }

            try
            {
                // Step 2: Find the event in the database.
                var eventToUpdate = await _context.OhEvents.FindAsync(eventId);
                if (eventToUpdate == null)
                {
                    return NotFound(new { message = "Event not found." });
                }

                // Step 3: Security check - ensure the current user is the host of the event.
                if (eventToUpdate.HostId != currentUserId)
                {
                    return Forbid("You are not the host of this event.");
                }

                // Step 4: Toggle the boolean value.
                eventToUpdate.ParticipationChecked = !eventToUpdate.ParticipationChecked;

                await _context.SaveChangesAsync();

                // Step 5: Return a success message and the new status.
                return Ok(new
                {
                    message = "Participation check status updated successfully.",
                    isChecked = eventToUpdate.ParticipationChecked
                });
            }
            catch (Exception ex)
            {
                // In a real application, you would log this exception.
                return StatusCode(500, $"An internal server error occurred: {ex.Message}");
            }
        }
        
                #region Recurrence Rule Helper Methods

        /// <summary>
        /// Generates a list of event instances based on a recurrence rule.
        /// </summary>
        /// <param name="isRecurring">Whether the event is recurring.</param>
        /// <param name="recurrenceRule">The iCalendar RRULE string.</param>
        /// <param name="startDate">The start date of the first event in the series.</param>
        /// <param name="endDate">The end date of the first event, used to calculate duration.</param>
        /// <returns>A list of OhEventInstance objects.</returns>
        //private List<OhEventInstance> GenerateEventInstances(
        //    bool isRecurring,
        //    string recurrenceRule,
        //    DateTime startDate,
        //    DateTime? endDate
        //)
        //{
        //    var instances = new List<OhEventInstance>();
        //    // Calculate the duration of a single event instance.
        //    var duration = (endDate ?? startDate) - startDate;

        //    // If it's a single, non-recurring event, create exactly one instance and return.
        //    // The logic to generate multiple instances below will only run for recurring events.
        //    if (!isRecurring || string.IsNullOrEmpty(recurrenceRule))
        //    {
        //        instances.Add(
        //            new OhEventInstance
        //            {
        //                StartTime = startDate,
        //                EndTime = startDate + duration,
        //                Status = "Scheduled",
        //            }
        //        );
        //        return instances;
        //    }

        //    // --- RRULE Parsing ---
        //    var rruleParts = recurrenceRule
        //        .Split(';')
        //        .Where(p => p.Contains('='))
        //        .Select(p => p.Split('='))
        //        .ToDictionary(sp => sp[0].ToUpper(), sp => sp[1]);

        //    // Extract parameters from the rule.
        //    string freq = rruleParts.GetValueOrDefault("FREQ");
        //    int.TryParse(rruleParts.GetValueOrDefault("COUNT"), out int count);
        //    DateTime? until = null;
        //    if (rruleParts.TryGetValue("UNTIL", out var untilString))
        //    {
        //        // Try to parse the iCalendar UTC format (e.g., 20250828T031700Z)
        //        if (
        //            DateTime.TryParseExact(
        //                untilString,
        //                "yyyyMMddTHHmmssZ",
        //                CultureInfo.InvariantCulture,
        //                DateTimeStyles.AdjustToUniversal,
        //                out var untilDate
        //            )
        //        )
        //        {
        //            until = untilDate.ToLocalTime();
        //        }
        //    }
        //    var byDay = new List<DayOfWeek>();
        //    if (rruleParts.TryGetValue("BYDAY", out var byDayString))
        //    {
        //        byDay = byDayString.Split(',').Select(d => ConvertToDayOfWeek(d)).ToList();
        //    }

        //    // --- Instance Generation ---
        //    var currentDate = startDate;
        //    const int maxInstances = 520; // Safety break for ~10 years of weekly events

        //    for (int i = 0; i < maxInstances; i++)
        //    {
        //        // Check termination conditions before generating the next instance.
        //        if (count > 0 && instances.Count >= count)
        //            break;

        //        DateTime nextOccurrenceDate;

        //        // Find the next valid date for an instance based on the frequency and BYDAY rules.
        //        switch (freq)
        //        {
        //            case "WEEKLY":
        //                var validDays = byDay.Any()
        //                    ? byDay
        //                    : new List<DayOfWeek> { startDate.DayOfWeek };
        //                var searchDate = currentDate;
        //                while (true)
        //                {
        //                    if (validDays.Contains(searchDate.DayOfWeek))
        //                    {
        //                        nextOccurrenceDate = searchDate;
        //                        break;
        //                    }
        //                    searchDate = searchDate.AddDays(1);
        //                }
        //                break;

        //            case "DAILY":
        //            default: // Default to daily if frequency is unknown
        //                nextOccurrenceDate = currentDate;
        //                break;
        //        }

        //        // Check termination conditions again with the actual occurrence date.
        //        if (until.HasValue && nextOccurrenceDate.Date > until.Value.Date)
        //            break;
        //        if (count > 0 && instances.Count >= count)
        //            break;

        //        // Add the new instance to the list.
        //        instances.Add(
        //            new OhEventInstance
        //            {
        //                StartTime = nextOccurrenceDate,
        //                EndTime = nextOccurrenceDate + duration,
        //                Status = "Scheduled",
        //            }
        //        );

        //        // Set the start for the next search to the day after the one we just found.
        //        currentDate = nextOccurrenceDate.AddDays(1);
        //    }

        //    return instances;
        //}

        ///// <summary>
        ///// Converts a two-letter iCalendar day representation to a .NET DayOfWeek enum.
        ///// </summary>
        ///// <param name="day">The two-letter day string (e.g., "SU", "MO").</param>
        ///// <returns>The corresponding DayOfWeek.</returns>
        //private DayOfWeek ConvertToDayOfWeek(string day)
        //{
        //    return day.ToUpper() switch
        //    {
        //        "SU" => DayOfWeek.Sunday,
        //        "MO" => DayOfWeek.Monday,
        //        "TU" => DayOfWeek.Tuesday,
        //        "WE" => DayOfWeek.Wednesday,
        //        "TH" => DayOfWeek.Thursday,
        //        "FR" => DayOfWeek.Friday,
        //        "SA" => DayOfWeek.Saturday,
        //        _ => throw new ArgumentException($"Invalid day of week '{day}'"),
        //    };
        //}

        #endregion

    }
}
