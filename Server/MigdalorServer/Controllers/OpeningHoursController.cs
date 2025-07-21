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
        // Service Endpoints
        // =============================================

        // GET: api/OpeningHours/services
        [HttpGet("services")]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetServices()
        {
            // Using the existing ServiceDto and OhService model properties
            return await _context
                .OhServices.AsNoTracking()
                .Select(s => new ServiceDto
                {
                    ServiceID = s.ServiceId,
                    HebrewName = s.HebrewName ?? "",
                    IsActive = s.IsActive ?? false,
                    // Omitting other fields for simplicity in this context
                })
                .ToListAsync();
        }

        // PUT: api/OpeningHours/services/5
        [HttpPut("services/{id}")]
        public async Task<IActionResult> UpdateService(int id, ServiceDto serviceDto)
        {
            if (id != serviceDto.ServiceID)
            {
                return BadRequest("ID mismatch.");
            }

            var service = await _context.OhServices.FindAsync(id);
            if (service == null)
            {
                return NotFound($"Service with ID {id} not found.");
            }

            // Update only the properties relevant to this management page
            service.HebrewName = serviceDto.HebrewName;
            service.IsActive = serviceDto.IsActive;

            _context.Entry(service).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.OhServices.Any(e => e.ServiceId == id))
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

        // =============================================
        // Opening Hours Endpoints
        // =============================================

        // GET: api/OpeningHours
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OpeningHourDto>>> GetOpeningHours()
        {
            // Correctly references OhOpeningHours, HourId, OpenTime, and CloseTime
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

        // PUT: api/OpeningHours/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOpeningHour(int id, OpeningHourDto openingHourDto)
        {
            if (id != openingHourDto.HourId)
            {
                return BadRequest("ID mismatch.");
            }

            var openingHour = await _context.OhOpeningHours.FindAsync(id);
            if (openingHour == null)
            {
                return NotFound($"Opening hour with ID {id} not found.");
            }

            // Map from DTO to the entity
            openingHour.DayOfWeek = openingHourDto.DayOfWeek;
            openingHour.OpenTime = TimeSpan.Parse(openingHourDto.OpenTime);
            openingHour.CloseTime = TimeSpan.Parse(openingHourDto.CloseTime);
            // NOTE: There is no 'IsActive' on the OhOpeningHour model

            _context.Entry(openingHour).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =============================================
        // Schedule Override Endpoints
        // =============================================

        // GET: api/OpeningHours/overrides
        [HttpGet("overrides")]
        public async Task<ActionResult<IEnumerable<ScheduleOverrideDto>>> GetScheduleOverrides()
        {
            // Correctly maps from OhScheduleOverride to ScheduleOverrideDto
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
                OverrideDate = dto.OverrideDate.Date, // Ensure it's just the date part
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

            dto.OverrideId = scheduleOverride.OverrideId; // Set the new ID on the DTO

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

            // Map all properties from the DTO to the entity
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
