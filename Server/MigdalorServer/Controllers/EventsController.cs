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

        // GET: api/events/{id}
        // This query now manually joins with OhPeople to get Host details.
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

        // POST: api/events/CreateEvent
        [HttpPost("CreateEvent")]
        [Authorize]
        public async Task<ActionResult<OhEvent>> CreateEvent([FromBody] AdminCreateEventDto createEventDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newEvent = new OhEvent
            {
                EventName = createEventDto.EventName,
                Description = createEventDto.Description,
                HostId = createEventDto.HostId,
                Location = createEventDto.Location,
                Capacity = createEventDto.Capacity,
                IsRecurring = createEventDto.IsRecurring,
                RecurrenceRule = createEventDto.RecurrenceRule,
                StartDate = createEventDto.StartDate,
                EndDate = createEventDto.EndDate,
                ParticipationChecked = false // Default value
            };

            _context.OhEvents.Add(newEvent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEventById), new { id = newEvent.EventId }, newEvent);
        }

        // PUT: api/events/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] AdminUpdateEventDto updateEventDto)
        {
            var eventToUpdate = await _context.OhEvents.FindAsync(id);

            if (eventToUpdate == null)
            {
                return NotFound();
            }

            eventToUpdate.EventName = updateEventDto.EventName;
            eventToUpdate.Description = updateEventDto.Description;
            eventToUpdate.Location = updateEventDto.Location;
            eventToUpdate.Capacity = updateEventDto.Capacity;
            eventToUpdate.IsRecurring = updateEventDto.IsRecurring;
            eventToUpdate.RecurrenceRule = updateEventDto.RecurrenceRule;
            eventToUpdate.StartDate = updateEventDto.StartDate;
            eventToUpdate.EndDate = updateEventDto.EndDate;

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

        // DELETE: api/events/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var ohEvent = await _context.OhEvents.FindAsync(id);
            if (ohEvent == null)
            {
                return NotFound();
            }

            _context.OhEvents.Remove(ohEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}