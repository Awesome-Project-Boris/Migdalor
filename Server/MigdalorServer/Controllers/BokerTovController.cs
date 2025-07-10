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
        public async Task<IActionResult> SignIn([FromBody] BokerTovRequest request)
        {
            // --- ADDED: Main try-catch block for robust error handling ---
            try
            {
                _logger.LogInformation("SignIn endpoint called for ResidentId: {ResidentId}", request.ResidentId);

                if (!Guid.TryParse(request.ResidentId, out Guid residentGuid))
                {
                    _logger.LogWarning("Invalid ResidentId format received: {ResidentId}", request.ResidentId);
                    return BadRequest("Invalid ResidentId format.");
                }

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out Guid tokenGuid))
                {
                    _logger.LogWarning("Invalid user ID format in token for claim value: {userIdClaim}", userIdClaim);
                    return Unauthorized("Invalid user ID format in token.");
                }

                if (residentGuid != tokenGuid)
                {
                    _logger.LogWarning("Token-User mismatch. Token GUID: {tokenGuid}, Request GUID: {residentGuid}", tokenGuid, residentGuid);
                    return Unauthorized("Token does not match the requested user.");
                }

                var today = DateTime.Now.Date;

                // 1. Mark attendance for the primary resident
                var residentSuccess = await MarkAttendance(residentGuid, today);
                if (!residentSuccess)
                {
                    _logger.LogWarning("Boker Tov record for Resident ID {ResidentId} on {Today} not found.", request.ResidentId, today);
                    return NotFound($"Could not find a Boker Tov record for you for today. Please contact administration.");
                }
                _logger.LogInformation("Successfully marked attendance for primary resident: {residentGuid}", residentGuid);


                // 2. If requested, mark attendance for the spouse
                if (request.IncludeSpouse)
                {
                    _logger.LogInformation("Attempting to sign in spouse for resident: {residentGuid}", residentGuid);
                    var resident = await _context.OhResidents
                                                 .AsNoTracking()
                                                 .FirstOrDefaultAsync(r => r.ResidentId == residentGuid);

                    if (resident?.SpouseId != null)
                    {
                        _logger.LogInformation("Found spouse with ID: {SpouseId}. Marking attendance.", resident.SpouseId.Value);
                        await MarkAttendance(resident.SpouseId.Value, today);
                    }
                    else
                    {
                        _logger.LogWarning("Attempted to sign in spouse for Resident ID {ResidentId}, but no SpouseId was found.", request.ResidentId);
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully saved all changes to the database.");
                return Ok(new { message = "Boker Tov recorded successfully." });
            }
            catch (Exception ex)
            {
                // --- ADDED: Detailed exception logging and response ---
                _logger.LogError(ex, "An unexpected error occurred in the SignIn endpoint for ResidentId: {ResidentId}", request.ResidentId);
                return StatusCode(500, $"An internal server error occurred: {ex.Message}");
            }
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
