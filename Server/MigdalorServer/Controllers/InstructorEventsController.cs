using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InstructorEventsController : ControllerBase
    {
        private readonly MigdalorDBContext _context;
        private static readonly TimeZoneInfo IsraelTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Israel Standard Time");

        public InstructorEventsController(MigdalorDBContext context)
        {
            _context = context;
        }

        [HttpGet("MyEvents")]
        public async Task<IActionResult> GetMyEvents()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("Invalid user token.");
            }

            var events = await _context.OhEvents
                .Where(e => e.HostId == userId)
                .Select(e => new { e.EventId, e.EventName })
                .ToListAsync();

            return Ok(events);
        }

        [HttpGet("{eventId}/Instances")]
        public async Task<IActionResult> GetEventInstances(int eventId)
        {
            var instances = await _context.OhEventInstances
                .Where(i => i.EventId == eventId && i.StartTime > DateTime.UtcNow && i.Status == "Scheduled")
                .OrderBy(i => i.StartTime)
                .Select(i => new { i.InstanceId, i.StartTime, i.EndTime })
                .ToListAsync();

            return Ok(instances);
        }

        [HttpPut("CancelInstance")]
        public async Task<IActionResult> CancelInstance([FromBody] CancelInstanceDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("Invalid user token.");
            }

            var instance = await _context.OhEventInstances
                .Include(i => i.Event)
                .FirstOrDefaultAsync(i => i.InstanceId == dto.InstanceId);

            if (instance == null) return NotFound("Meeting instance not found.");
            if (instance.Event.HostId != userId) return Forbid("You are not authorized to modify this meeting.");

            instance.Status = "Cancelled";
            instance.Notes = dto.Notes;

            var participantIds = await _context.OhEventRegistrations
                .Where(r => r.EventId == instance.EventId && r.Status == "Active")
                .Select(r => r.ParticipantId)
                .ToListAsync();

            if (participantIds.Any())
            {
                var localStartTime = instance.StartTime;

                var notice = new OhNotice
                {
                    SenderId = userId,
                    NoticeTitle = $"Meeting Cancelled: {instance.Event.EventName}",
                    NoticeMessage = $"The meeting for '{instance.Event.EventName}' on {localStartTime:yyyy-MM-dd @ h:mm tt} has been cancelled. Reason: {dto.Notes}",
                    CreationDate = DateTime.UtcNow,
                    NoticeCategory = "חוגים"
                };
                _context.OhNotices.Add(notice);
            }

            await _context.SaveChangesAsync();
            return Ok("Meeting cancelled and a public notice has been posted.");
        }

        [HttpPost("RescheduleInstance")]
        public async Task<IActionResult> RescheduleInstance([FromBody] RescheduleInstanceDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("Invalid user token.");
            }

            // Convert incoming UTC time to local time for validation
            var newStartTimeLocal = TimeZoneInfo.ConvertTimeFromUtc(dto.NewStartTime, IsraelTimeZone);

            // FIXED: Add server-side check to prevent rescheduling to a past date/time.
            if (newStartTimeLocal < DateTime.Now)
            {
                return BadRequest("Cannot reschedule a meeting to a time that has already passed.");
            }

            var originalInstance = await _context.OhEventInstances
                .Include(i => i.Event)
                .FirstOrDefaultAsync(i => i.InstanceId == dto.InstanceId);

            if (originalInstance == null) return NotFound("Meeting instance not found.");
            if (originalInstance.Event.HostId != userId) return Forbid("You are not authorized to modify this meeting.");

            var newEndTimeLocal = TimeZoneInfo.ConvertTimeFromUtc(dto.NewEndTime, IsraelTimeZone);
            var originalStartTimeLocal = originalInstance.StartTime;

            originalInstance.Status = "Rescheduled";
            originalInstance.Notes = $"Moved to {newStartTimeLocal:yyyy-MM-dd @ h:mm tt}. Reason: {dto.Notes}";

            var newInstance = new OhEventInstance
            {
                EventId = originalInstance.EventId,
                StartTime = newStartTimeLocal,
                EndTime = newEndTimeLocal,
                Status = "Scheduled",
                Notes = $"Rescheduled from {originalStartTimeLocal:yyyy-MM-dd @ h:mm tt}"
            };
            _context.OhEventInstances.Add(newInstance);

            var participantIds = await _context.OhEventRegistrations
                .Where(r => r.EventId == originalInstance.EventId && r.Status == "Active")
                .Select(r => r.ParticipantId)
                .ToListAsync();

            if (participantIds.Any())
            {
                var notice = new OhNotice
                {
                    SenderId = userId,
                    NoticeTitle = $"Meeting Rescheduled: {originalInstance.Event.EventName}",
                    NoticeMessage = $"The meeting for '{originalInstance.Event.EventName}' on {originalStartTimeLocal:yyyy-MM-dd @ h:mm tt} has been moved to {newStartTimeLocal:yyyy-MM-dd @ h:mm tt}. Reason: {dto.Notes}",
                    CreationDate = DateTime.UtcNow,
                    NoticeCategory = "חוגים"
                };
                _context.OhNotices.Add(notice);
            }

            await _context.SaveChangesAsync();
            return Ok("Meeting rescheduled and a public notice has been posted.");
        }
    }
}
