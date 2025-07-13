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

                var events = await _context.OhEvents
                    .AsNoTracking()
                    .Where(e =>
                        (e.IsRecurring == false && e.StartDate > now) ||
                        (e.IsRecurring == true && e.EndDate > now)
                    )
                    .Select(e => new EventDto
                    {
                        EventId = e.EventId,
                        EventName = e.EventName,
                        Description = e.Description,
                        Location = e.Location,
                        IsRecurring = e.IsRecurring,
                        StartDate = e.StartDate,
                        EndDate = e.EndDate,
                        Capacity = e.Capacity,
                        // This line counts the registrations for each event
                        ParticipantsCount = e.OhEventRegistrations.Count()
                    }).ToListAsync();

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
                                         join p in _context.OhPeople on e.HostId equals p.PersonId into hostGroup
                                         from h in hostGroup.DefaultIfEmpty() // This makes it a LEFT JOIN
                                         where e.EventId == id
                                         select new EventDetailDto
                                         {
                                             EventId = e.EventId,
                                             EventName = e.EventName,
                                             Description = e.Description,
                                             Location = e.Location,
                                             IsRecurring = e.IsRecurring,
                                             StartDate = e.StartDate,
                                             EndDate = e.EndDate,
                                             Capacity = e.Capacity,
                                             Host = h == null ? null : new HostDto
                                             {
                                                 HostId = h.PersonId,
                                                 EnglishName = h.EngFirstName + " " + h.EngLastName,
                                                 HebrewName = h.HebFirstName + " " + h.HebLastName
                                             }
                                         }).FirstOrDefaultAsync();

                if (eventDetail == null)
                {
                    return NotFound("Event not found.");
                }

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

        // 4. POST: api/events/attendance
        // CORRECTED: Uses 'OhParticipation' which matches your DbContext.
        [HttpPost("attendance")]
        public async Task<IActionResult> UpdateAttendance([FromBody] UpdateAttendanceDto attendanceDto)
        {
            try
            {
                var attendanceRecord = await _context.OhParticipations
                    .FirstOrDefaultAsync(a => a.InstanceId == attendanceDto.InstanceId && a.ParticipantId == attendanceDto.ParticipantId);

                if (attendanceRecord != null)
                {
                    attendanceRecord.Status = attendanceDto.Status;
                }
                else
                {
                    // Use the correct class name 'OhParticipation' from the generated model.
                    var newRecord = new OhParticipation
                    {
                        InstanceId = attendanceDto.InstanceId,
                        ParticipantId = attendanceDto.ParticipantId,
                        Status = attendanceDto.Status,
                        SignInTime = DateTime.UtcNow
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

            try
            {
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
                    EndTime = e.EndDate ?? e.StartDate, // Use StartDate if EndDate is null
                    SourceTable = "OH_Events",
                    NavigationEventId = e.EventId // The event's own ID is used for navigation
                })
                .ToListAsync();
            allEntries.AddRange(oneTimeEvents);

            // 2. Get recurring event instances from OH_EventInstances
            var eventInstances = await _context.OhEventInstances
                .Where(i => i.StartTime >= startDate && i.StartTime <= endDate)
                .Join(_context.OhEvents, // Join with OhEvents to get details like name and location
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
                          NavigationEventId = parentEvent.EventId // The PARENT event's ID is used for navigation
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
                    NavigationEventId = null // No navigation for manual additions
                })
                .ToListAsync();
            allEntries.AddRange(manualAdditions);

            // Return the combined list, ordered by start time
            return Ok(allEntries.OrderBy(e => e.StartTime));
        }
    }
}