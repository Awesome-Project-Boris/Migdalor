// Controllers/OpeningHoursController.cs
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using Migdalor.DTOs;

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

        // GET: api/OpeningHours/services
        [HttpGet("services")]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetServices()
        {
            return await _context
                .OhServices.Select(s => new ServiceDto
                {
                    ServiceID = s.ServiceId,
                    HebrewName = s.HebrewName,
                    IsActive = (bool)s.IsActive,
                })
                .ToListAsync();
        }

        // PUT: api/OpeningHours/services/5
        [HttpPut("services/{id}")]
        public async Task<IActionResult> UpdateService(int id, ServiceDto serviceDto)
        {
            if (id != serviceDto.ServiceID)
            {
                return BadRequest();
            }

            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            service.Name = serviceDto.HebrewName;
            service.IsActive = serviceDto.IsActive;

            _context.Entry(service).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Services.Any(e => e.Id == id))
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

        // GET: api/OpeningHours
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OpeningHourDto>>> GetOpeningHours()
        {
            return await _context
                .OpeningHours.Select(o => new OpeningHourDto
                {
                    Id = o.Id,
                    ServiceId = o.ServiceId,
                    DayOfWeek = o.DayOfWeek,
                    FromTime = o.FromTime,
                    ToTime = o.ToTime,
                    IsActive = o.IsActive,
                })
                .ToListAsync();
        }

        // PUT: api/OpeningHours/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOpeningHour(int id, OpeningHourDto openingHourDto)
        {
            if (id != openingHourDto.Id)
            {
                return BadRequest();
            }

            var openingHour = await _context.OpeningHours.FindAsync(id);
            if (openingHour == null)
            {
                return NotFound();
            }

            openingHour.DayOfWeek = openingHourDto.DayOfWeek;
            openingHour.FromTime = openingHourDto.FromTime;
            openingHour.ToTime = openingHourDto.ToTime;
            openingHour.IsActive = openingHourDto.IsActive;

            _context.Entry(openingHour).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.OpeningHours.Any(e => e.Id == id))
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

        // GET: api/OpeningHours/overrides
        [HttpGet("overrides")]
        public async Task<ActionResult<IEnumerable<ScheduleOverrideDto>>> GetScheduleOverrides()
        {
            return await _context
                .ScheduleOverrides.Select(o => new ScheduleOverrideDto
                {
                    Id = o.Id,
                    ServiceId = o.ServiceId,
                    StartTime = o.StartTime,
                    EndTime = o.EndTime,
                    Description = o.Description,
                    IsActive = o.IsActive,
                })
                .ToListAsync();
        }

        // POST: api/OpeningHours/overrides
        [HttpPost("overrides")]
        public async Task<ActionResult<ScheduleOverrideDto>> AddScheduleOverride(
            ScheduleOverrideDto scheduleOverrideDto
        )
        {
            var scheduleOverride = new OhScheduleOverride
            {
                ServiceId = scheduleOverrideDto.ServiceId,
                StartTime = scheduleOverrideDto.StartTime,
                EndTime = scheduleOverrideDto.EndTime,
                Description = scheduleOverrideDto.Description,
                IsActive = scheduleOverrideDto.IsActive,
            };

            _context.ScheduleOverrides.Add(scheduleOverride);
            await _context.SaveChangesAsync();

            scheduleOverrideDto.Id = scheduleOverride.Id;

            return CreatedAtAction(
                nameof(GetScheduleOverrides),
                new { id = scheduleOverride.Id },
                scheduleOverrideDto
            );
        }

        // PUT: api/OpeningHours/overrides/5
        [HttpPut("overrides/{id}")]
        public async Task<IActionResult> UpdateScheduleOverride(
            int id,
            ScheduleOverrideDto scheduleOverrideDto
        )
        {
            if (id != scheduleOverrideDto.Id)
            {
                return BadRequest();
            }

            var scheduleOverride = await _context.ScheduleOverrides.FindAsync(id);
            if (scheduleOverride == null)
            {
                return NotFound();
            }

            scheduleOverride.StartTime = scheduleOverrideDto.StartTime;
            scheduleOverride.EndTime = scheduleOverrideDto.EndTime;
            scheduleOverride.Description = scheduleOverrideDto.Description;
            scheduleOverride.IsActive = scheduleOverrideDto.IsActive;

            _context.Entry(scheduleOverride).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.ScheduleOverrides.Any(e => e.Id == id))
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

        // DELETE: api/OpeningHours/overrides/5
        [HttpDelete("overrides/{id}")]
        public async Task<IActionResult> DeleteScheduleOverride(int id)
        {
            var scheduleOverride = await _context.ScheduleOverrides.FindAsync(id);
            if (scheduleOverride == null)
            {
                return NotFound();
            }

            _context.ScheduleOverrides.Remove(scheduleOverride);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
