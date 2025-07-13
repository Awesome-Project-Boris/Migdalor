using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Controllers
{
    // This DTO was updated to BokerTovRequest
    // public class SignInRequest ...

    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Secure the entire controller
    public class BokerTovController : ControllerBase
    {
        private readonly MigdalorDBContext _context;
        private readonly ILogger<BokerTovController> _logger;

        public BokerTovController(MigdalorDBContext context, ILogger<BokerTovController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("SignIn")]
        [Authorize]
        public async Task<IActionResult> SignIn([FromBody] BokerTovRequest request)
        {
            try
            {
                if (!Guid.TryParse(request.ResidentId, out Guid residentGuid))
                {
                    return BadRequest("Invalid ResidentId format.");
                }

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out Guid tokenGuid))
                {
                    return Unauthorized("Invalid user ID format in token.");
                }

                if (residentGuid != tokenGuid)
                {
                    return Unauthorized("Token does not match the requested user.");
                }

                // 1. Mark attendance for the primary resident
                var residentSuccess = await MarkAttendance(residentGuid);
                if (!residentSuccess)
                {
                    _logger.LogWarning("Boker Tov record for Resident ID {ResidentId} could not be found.", request.ResidentId);
                    return NotFound($"Could not find a Boker Tov record for you. Please contact administration.");
                }

                // 2. If requested, mark attendance for the spouse
                if (request.IncludeSpouse)
                {
                    var resident = await _context.OhResidents
                                                 .AsNoTracking()
                                                 .FirstOrDefaultAsync(r => r.ResidentId == residentGuid);

                    if (resident?.SpouseId != null)
                    {
                        await MarkAttendance(resident.SpouseId.Value);
                    }
                    else
                    {
                        _logger.LogWarning("Attempted to sign in spouse for Resident ID {ResidentId}, but no SpouseId was found.", request.ResidentId);
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Boker Tov recorded successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred in the SignIn endpoint for ResidentId: {ResidentId}", request.ResidentId);
                return StatusCode(500, $"An internal server error occurred: {ex.Message}");
            }
        }

        /// <summary>
        /// Finds a resident's BokerTov record, updates its date to today, and marks it as signed in.
        /// </summary>
        /// <param name="residentId">The Guid ID of the resident to mark.</param>
        /// <returns>True if the record was found and updated, otherwise false.</returns>
        private async Task<bool> MarkAttendance(Guid residentId)
        {
            // Find the resident's record without checking the date.
            var attendanceRecord = await _context.OhBokerTovs
                .FirstOrDefaultAsync(a => a.ResidentId == residentId);

            if (attendanceRecord == null)
            {
                _logger.LogWarning("MarkAttendance failed: No record found for ResidentId {residentId}", residentId);
                return false; // Record not found
            }

            // Update the date to today before marking attendance.
            attendanceRecord.AttendanceDate = DateTime.Now.Date;

            // Only update if they haven't already signed in for this new "day"
            if (!attendanceRecord.HasSignedIn)
            {
                attendanceRecord.HasSignedIn = true;
                attendanceRecord.SignInTime = DateTime.Now;
            }
            return true;
        }

        /// <summary>
        /// Finds a BokerTov record for a given resident and date, and updates it.
        /// </summary>
        private async Task<bool> MarkAttendance(Guid residentId, DateTime date)
        {
            var attendanceRecord = await _context.OhBokerTovs
                .FirstOrDefaultAsync(a => a.ResidentId == residentId && a.AttendanceDate.Date == date);

            if (attendanceRecord == null)
            {
                _logger.LogWarning("MarkAttendance failed: No record found for ResidentId {residentId} on date {date}", residentId, date);
                return false; // Record not found
            }

            if (!attendanceRecord.HasSignedIn)
            {
                attendanceRecord.HasSignedIn = true;
                attendanceRecord.SignInTime = DateTime.Now;
            }
            else
            {
                _logger.LogInformation("Resident {residentId} was already signed in.", residentId);
            }
            return true;
        }
    }
}
