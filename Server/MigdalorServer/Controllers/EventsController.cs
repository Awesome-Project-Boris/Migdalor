using System;
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

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly MigdalorDBContext _context;

        public EventsController(MigdalorDBContext context)
        {
            _context = context;
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
                        // Perform a LEFT JOIN to get picture details
                    join pic in _context.OhPictures on e.PictureId equals pic.PicId into picGroup
                    from pg in picGroup.DefaultIfEmpty()
                    where (e.IsRecurring == false && e.StartDate > now) ||
                          (e.IsRecurring == true && e.EndDate > now)
                    select new EventDto
                    {
                        EventId = e.EventId,
                        EventName = e.EventName,
                        Description = e.Description,
                        Location = e.Location,
                        PictureId = e.PictureId,
                        PicturePath = pg.PicPath, 
                        IsRecurring = e.IsRecurring,
                        StartDate = e.StartDate,
                        EndDate = e.EndDate,
                        Capacity = e.Capacity,
                        ParticipantsCount = e.OhEventRegistrations.Count()
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

        // 2. GET: api/events/{id}
        // CORRECTED: This query now manually joins with OhPeople to get Host details.
        [HttpGet("{id}")]
        public async Task<ActionResult<EventDetailDto>> GetEventById(int id)
        {
            try
            {
                var eventDetail = await (from e in _context.OhEvents
                                             // Join to get host
                                         join p in _context.OhPeople on e.HostId equals p.PersonId into hostGroup
                                         from h in hostGroup.DefaultIfEmpty()
                                             // Join to get picture path
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
                                             ParticipationChecked = e.ParticipationChecked,
                                             StartDate = e.StartDate,
                                             EndDate = e.EndDate,
                                             Capacity = e.Capacity,
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

        // 3. GET: api/events/{eventId}/participants
        // CORRECTED: This query now manually joins OhEventRegistrations with OhPeople.
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

        
        // 5. GET: api/events/host/{hostId}
        // Pulls all events hosted by a specific person
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
                        StartDate = e.StartDate,
                        EndDate = e.EndDate,
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

                if (registrations.Count >= eventToRegister.Capacity)
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
                    Status = "Active", // Default status
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

        // Inside the EventsController class

        [HttpPost("CreateActivity")]
        [Authorize] // Ensure only authenticated users can create events
        public async Task<IActionResult> CreateActivity([FromBody] NewActivityDto eventDto)
        {
            // --- Security Check: User can only create an event for themselves ---
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || eventDto.HostId.ToString() != userIdClaim)
            {
                return Forbid("You can only create events for yourself.");
            }
            // --- End Security Check ---

            // --- Permission Check (as implemented before) ---
            var canInitiate = await _context.OhResidents
                                            .Where(r => r.ResidentId == eventDto.HostId)
                                            .Select(r => r.CanInitActivity)
                                            .FirstOrDefaultAsync();

            if (!canInitiate)
            {
                return Forbid("You do not have permission to initiate new activities.");
            }
            // --- End Permission Check ---

            try
            {
                // --- NEW: Check for duplicate event name before trying to insert ---
                var eventNameExists = await _context.OhEvents.AnyAsync(e => e.EventName == eventDto.EventName);
                if (eventNameExists)
                {
                    // Return a 409 Conflict error with a clear message
                    return Conflict("An event with this name already exists. Please choose a different name.");
                }
                // --- End of new check ---

                var newEvent = new OhEvent
                {
                    EventName = eventDto.EventName,
                    Description = eventDto.Description,
                    HostId = eventDto.HostId,
                    Location = eventDto.Location,
                    PictureId = eventDto.PictureId,
                    Capacity = eventDto.Capacity,
                    IsRecurring = false, // Always false for this form
                    RecurrenceRule = null,
                    StartDate = eventDto.StartDate,
                    EndDate = eventDto.EndDate,
                };

                _context.OhEvents.Add(newEvent);
                await _context.SaveChangesAsync();

                // Return the created event, including its new ID
                return CreatedAtAction(nameof(GetEventById), new { id = newEvent.EventId }, newEvent);
            }
            catch (Exception ex)
            {
                // Log the exception ex
                return StatusCode(500, "An internal server error occurred while creating the event.");
            }
        }

        [HttpGet("timetable")]
        public async Task<ActionResult<IEnumerable<TimetableEntryDto>>> GetTimetableEntries([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            if (startDate == default || endDate == default)
            {
                return BadRequest("Please provide both a startDate and an endDate.");
            }

            var allEntries = new List<TimetableEntryDto>();

            // 1. Get one-time events from OH_Events
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

            // 2. Get recurring event instances from OH_EventInstances
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

            // 3. Get manual additions from OH_TimeTableAdditions
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

            // Return the combined list, ordered by start time
            return Ok(allEntries.OrderBy(e => e.StartTime));
        }

        [HttpPost("{eventId}/mark-checked")]
        [Authorize]
        public async Task<IActionResult> MarkParticipationAsChecked(int eventId)
        {
            try
            {
                var eventToUpdate = await _context.OhEvents.FindAsync(eventId);

                if (eventToUpdate == null)
                {
                    return NotFound("Event not found.");
                }

                // --- FIX: Toggle the boolean value ---
                eventToUpdate.ParticipationChecked = !eventToUpdate.ParticipationChecked;
                await _context.SaveChangesAsync();

                // Return a clear message and the new status
                var message = eventToUpdate.ParticipationChecked
                    ? "Event participation has been successfully marked as checked."
                    : "Event participation marking has been reopened.";

                return Ok(new { message, isChecked = eventToUpdate.ParticipationChecked });
            }
            catch (Exception ex)
            {
                // In a real app, you would log the exception ex
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal server error occurred.");
            }
        }

    }
}