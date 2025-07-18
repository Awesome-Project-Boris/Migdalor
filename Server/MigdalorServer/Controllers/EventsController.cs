using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class EventsController : ControllerBase
    {
        // GET: api/events?isRecurring=false
        [HttpGet]
        public async Task<IActionResult> GetEvents([FromQuery] bool isRecurring)
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
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/events
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto eventDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var newEvent = await OhEvent.AddEventAsync(eventDto);
                var resultDto = new EventDto
                {
                    Id = newEvent.EventId, // Corrected property name
                    EventName = newEvent.EventName,
                    // Map other fields as necessary
                };
                return CreatedAtAction(nameof(GetEvents), new { id = resultDto.Id }, resultDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/events/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] CreateEventDto eventDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updatedEvent = await OhEvent.UpdateEventAsync(id, eventDto);
                return Ok(updatedEvent);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/events/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            try
            {
                await OhEvent.DeleteEventAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
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
