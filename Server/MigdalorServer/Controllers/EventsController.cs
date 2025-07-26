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

        [HttpGet("creator/{creatorId}")]
        public async Task<IActionResult> GetEventsByCreator(Guid creatorId)
        {
            try
            {
                var query = from e in _context.OhEvents
                                // Perform a LEFT JOIN with the pictures table
                            join pic in _context.OhPictures on e.PictureId equals pic.PicId into picGroup
                            from pg in picGroup.DefaultIfEmpty()
                                // Filter by the creator's ID and for non-recurring events
                            where e.HostId == creatorId && !e.IsRecurring
                            orderby e.StartDate descending
                            select new MyActivitiesDto
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
                                ParticipationChecked = e.ParticipationChecked
                            };

                var userEvents = await query.AsNoTracking().ToListAsync();

                return Ok(userEvents ?? new List<MyActivitiesDto>());
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

    }
}
