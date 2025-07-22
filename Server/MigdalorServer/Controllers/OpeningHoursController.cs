// --- Controllers/OpeningHoursController.cs ---
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Migdalor.DTOs; // Assuming DTOs are in this namespace
using MigdalorServer.Database; // Correct context namespace
using MigdalorServer.Models; // Correct models namespace

namespace Migdalor.Admin.Panel.Controllers
{
    // NEW DTO: Defines the structure for the batch update payload from the frontend.
    public class WeeklyScheduleUpdateDto
    {
        public List<OpeningHourDto> ToCreate { get; set; } = new List<OpeningHourDto>();
        public List<OpeningHourDto> ToUpdate { get; set; } = new List<OpeningHourDto>();
        public List<int> ToDelete { get; set; } = new List<int>();
    }

    [Route("api/[controller]")]
    [ApiController]
    public class OpeningHoursController : ControllerBase
    {
        private readonly MigdalorDBContext _context;

        public OpeningHoursController(MigdalorDBContext context)
        {
            _context = context;
        }

        // =============================================
        // Opening Hours Endpoints
        // =============================================

        // GET: api/OpeningHours
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OpeningHourDto>>> GetOpeningHours()
        {
            return await _context
                .OhOpeningHours.AsNoTracking()
                .Select(o => new OpeningHourDto
                {
                    HourId = o.HourId,
                    ServiceId = o.ServiceId,
                    DayOfWeek = o.DayOfWeek,
                    OpenTime = o.OpenTime.ToString(@"hh\:mm"),
                    CloseTime = o.CloseTime.ToString(@"hh\:mm"),
                })
                .ToListAsync();
        }

        // NEW ENDPOINT: Handles batch creation, updates, and deletion of opening hours in a single transaction.
        [HttpPost("batch-update")]
        public async Task<IActionResult> BatchUpdateOpeningHours([FromBody] WeeklyScheduleUpdateDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Invalid payload.");
            }

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // 1. Handle Deletions
                    if (dto.ToDelete.Any())
                    {
                        var hoursToDelete = await _context.OhOpeningHours
                            .Where(h => dto.ToDelete.Contains(h.HourId))
                            .ToListAsync();

                        _context.OhOpeningHours.RemoveRange(hoursToDelete);
                    }

                    // 2. Handle Updates
                    if (dto.ToUpdate.Any())
                    {
                        foreach (var hourDto in dto.ToUpdate)
                        {
                            var hourToUpdate = await _context.OhOpeningHours.FindAsync(hourDto.HourId);
                            if (hourToUpdate != null)
                            {
                                hourToUpdate.OpenTime = TimeSpan.Parse(hourDto.OpenTime);
                                hourToUpdate.CloseTime = TimeSpan.Parse(hourDto.CloseTime);
                                _context.Entry(hourToUpdate).State = EntityState.Modified;
                            }
                        }
                    }

                    // 3. Handle Creations
                    if (dto.ToCreate.Any())
                    {
                        foreach (var hourDto in dto.ToCreate)
                        {
                            var newHour = new OhOpeningHour
                            {
                                ServiceId = hourDto.ServiceId,
                                DayOfWeek = hourDto.DayOfWeek,
                                OpenTime = TimeSpan.Parse(hourDto.OpenTime),
                                CloseTime = TimeSpan.Parse(hourDto.CloseTime)
                            };
                            _context.OhOpeningHours.Add(newHour);
                        }
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new { message = "Weekly schedule updated successfully." });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    // Log the exception (ex) here for debugging purposes
                    return StatusCode(500, "An error occurred while updating the schedule. The operation was rolled back.");
                }
            }
        }

        // REMOVED: The single PUT endpoint is now obsolete.
        // The new batch-update endpoint handles all modifications.

        // =============================================
        // Schedule Override Endpoints
        // =============================================

        // GET: api/OpeningHours/overrides
        [HttpGet("overrides")]
        public async Task<ActionResult<IEnumerable<ScheduleOverrideDto>>> GetScheduleOverrides()
        {
            return await _context
                .OhScheduleOverrides.AsNoTracking()
                .Select(o => new ScheduleOverrideDto
                {
                    OverrideId = o.OverrideId,
                    ServiceId = o.ServiceId,
                    OverrideDate = o.OverrideDate,
                    IsOpen = o.IsOpen,
                    OpenTime = o.OpenTime.HasValue ? o.OpenTime.Value.ToString(@"hh\:mm") : null,
                    CloseTime = o.CloseTime.HasValue ? o.CloseTime.Value.ToString(@"hh\:mm") : null,
                    Notes = o.Notes,
                })
                .ToListAsync();
        }

        // POST: api/OpeningHours/overrides
        [HttpPost("overrides")]
        public async Task<ActionResult<ScheduleOverrideDto>> AddScheduleOverride(
            ScheduleOverrideDto dto
        )
        {
            var scheduleOverride = new OhScheduleOverride
            {
                ServiceId = dto.ServiceId,
                OverrideDate = dto.OverrideDate.Date,
                IsOpen = dto.IsOpen,
                OpenTime = !string.IsNullOrEmpty(dto.OpenTime)
                    ? (TimeSpan?)TimeSpan.Parse(dto.OpenTime)
                    : null,
                CloseTime = !string.IsNullOrEmpty(dto.CloseTime)
                    ? (TimeSpan?)TimeSpan.Parse(dto.CloseTime)
                    : null,
                Notes = dto.Notes,
            };

            _context.OhScheduleOverrides.Add(scheduleOverride);
            await _context.SaveChangesAsync();

            dto.OverrideId = scheduleOverride.OverrideId;

            return CreatedAtAction(nameof(GetScheduleOverrides), new { id = dto.OverrideId }, dto);
        }

        // PUT: api/OpeningHours/overrides/5
        [HttpPut("overrides/{id}")]
        public async Task<IActionResult> UpdateScheduleOverride(int id, ScheduleOverrideDto dto)
        {
            if (id != dto.OverrideId)
            {
                return BadRequest("ID mismatch.");
            }

            var scheduleOverride = await _context.OhScheduleOverrides.FindAsync(id);
            if (scheduleOverride == null)
            {
                return NotFound();
            }

            scheduleOverride.OverrideDate = dto.OverrideDate.Date;
            scheduleOverride.IsOpen = dto.IsOpen;
            scheduleOverride.OpenTime = !string.IsNullOrEmpty(dto.OpenTime)
                ? (TimeSpan?)TimeSpan.Parse(dto.OpenTime)
                : null;
            scheduleOverride.CloseTime = !string.IsNullOrEmpty(dto.CloseTime)
                ? (TimeSpan?)TimeSpan.Parse(dto.CloseTime)
                : null;
            scheduleOverride.Notes = dto.Notes;
            scheduleOverride.ServiceId = dto.ServiceId;

            _context.Entry(scheduleOverride).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/OpeningHours/overrides/5
        [HttpDelete("overrides/{id}")]
        public async Task<IActionResult> DeleteScheduleOverride(int id)
        {
            var scheduleOverride = await _context.OhScheduleOverrides.FindAsync(id);
            if (scheduleOverride == null)
            {
                return NotFound();
            }

            _context.OhScheduleOverrides.Remove(scheduleOverride);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
