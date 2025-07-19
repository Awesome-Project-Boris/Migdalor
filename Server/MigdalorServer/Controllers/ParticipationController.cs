using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs; 
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Secure the entire controller
    public class ParticipationController : ControllerBase
    {
        private readonly MigdalorDBContext _context;
        private readonly ILogger<ParticipationController> _logger;

        public ParticipationController(MigdalorDBContext context, ILogger<ParticipationController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Creates or updates a participation record for a given event and participant.
        /// </summary>
        [HttpPost("update")]
        public async Task<IActionResult> UpdateParticipation([FromBody] UpdateParticipationDto participationDto)
        {
            try
            {
                var participationRecord = await _context.OhParticipations
                    .FirstOrDefaultAsync(p => p.EventId == participationDto.EventId && p.ParticipantId == participationDto.ParticipantId);

                if (participationRecord != null)
                {
                    // Record exists: Update status and timestamp
                    _logger.LogInformation("Updating participation for ParticipantId {ParticipantId} in EventId {EventId} to status {Status}", participationDto.ParticipantId, participationDto.EventId, participationDto.Status);
                    participationRecord.Status = participationDto.Status;
                    participationRecord.RegistrationTime = DateTime.UtcNow;
                }
                else
                {
                    // Record does not exist: Create a new one
                    _logger.LogInformation("Creating new participation for ParticipantId {ParticipantId} in EventId {EventId} with status {Status}", participationDto.ParticipantId, participationDto.EventId, participationDto.Status);
                    var newRecord = new OhParticipation
                    {
                        EventId = participationDto.EventId,
                        ParticipantId = participationDto.ParticipantId,
                        Status = participationDto.Status,
                        RegistrationTime = DateTime.UtcNow
                    };
                    _context.OhParticipations.Add(newRecord);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Participation updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred in UpdateParticipation for EventId: {EventId}", participationDto.EventId);
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        /// <summary>
        /// Gets the participation status for all participants of a specific event.
        /// </summary>
        [HttpGet("{eventId}")]
        public async Task<IActionResult> GetParticipation(int eventId)
        {
            try
            {
                var participationList = await _context.OhParticipations
                    .Where(p => p.EventId == eventId)
                    .Select(p => new ParticipationStatusDto // Use the DTO to send clean data
                    {
                        ParticipantId = p.ParticipantId,
                        Status = p.Status
                    })
                    .ToListAsync();

                return Ok(participationList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred while fetching participation for EventId: {EventId}", eventId);
                return StatusCode(500, "An internal server error occurred.");
            }
        }
    }
}