using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Migdalor.DTOs;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;

namespace Migdalor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly MigdalorDBContext _context;

        public ServicesController(MigdalorDBContext context)
        {
            _context = context;
        }

        [HttpGet("GetAllServices")]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetAllServices()
        {
            var allServices = await _context.OhServices
                                            .Where(s => s.IsActive == true)
                                            .Include(s => s.Picture) // Eager load the Picture navigation property
                                            .AsNoTracking()
                                            .ToListAsync();

            var allOpeningHours = await _context.OhOpeningHours
                                                .AsNoTracking()
                                                .ToListAsync();

            if (!allServices.Any())
            {
                return NotFound("No active services found.");
            }

            var hoursByServiceId = allOpeningHours.GroupBy(h => h.ServiceId)
                .ToDictionary(g => g.Key, g => g.Select(oh => new OpeningHourDto
                {
                    DayOfWeek = oh.DayOfWeek,
                    OpenTime = oh.OpenTime.ToString(@"hh\:mm"),
                    CloseTime = oh.CloseTime.ToString(@"hh\:mm")
                }).ToList());

            var serviceDtoMap = allServices.ToDictionary(
                s => s.ServiceId,
                s => new ServiceDto
                {
                    ServiceID = s.ServiceId,
                    ParentService = s.ParentService,
                    HebrewName = s.HebrewName ?? "",
                    EnglishName = s.EnglishName ?? "",
                    HebrewDescription = s.HebrewDescription ?? "",
                    EnglishDescription = s.EnglishDescription ?? "",
                    HebrewAddendum = s.HebrewAddendum ?? "",
                    EnglishAddendum = s.EnglishAddendum ?? "",
                    PictureID = s.PictureId,
                    PicturePath = s.Picture?.PicPath, // This line includes the picture path
                    IsActive = s.IsActive ?? false,
                    OpeningHours = hoursByServiceId.GetValueOrDefault(s.ServiceId, new List<OpeningHourDto>())
                });

            var rootServices = new List<ServiceDto>();
            foreach (var dto in serviceDtoMap.Values)
            {
                if (dto.ParentService.HasValue && serviceDtoMap.TryGetValue(dto.ParentService.Value, out var parentDto))
                {
                    parentDto.SubServices.Add(dto);
                }
                else
                {
                    rootServices.Add(dto);
                }
            }

            return Ok(rootServices);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OhService>>> GetServices()
        {
            return await _context.OhServices.AsNoTracking().ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<OhService>> CreateService([FromBody] ServiceDto serviceDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newService = new OhService
            {
                HebrewName = serviceDto.HebrewName,
                EnglishName = serviceDto.EnglishName,
                HebrewDescription = serviceDto.HebrewDescription,
                EnglishDescription = serviceDto.EnglishDescription,
                HebrewAddendum = serviceDto.HebrewAddendum,
                EnglishAddendum = serviceDto.EnglishAddendum,
                ParentService = serviceDto.ParentService,
                PictureId = serviceDto.PictureID,
                IsActive = serviceDto.IsActive,
            };

            _context.OhServices.Add(newService);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetServices),
                new { id = newService.ServiceId },
                newService
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] ServiceDto serviceDto)
        {
            if (id != serviceDto.ServiceID)
            {
                return BadRequest("Service ID mismatch.");
            }

            var serviceToUpdate = await _context.OhServices.FindAsync(id);

            if (serviceToUpdate == null)
            {
                return NotFound();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            serviceToUpdate.HebrewName = serviceDto.HebrewName;
            serviceToUpdate.EnglishName = serviceDto.EnglishName;
            serviceToUpdate.HebrewDescription = serviceDto.HebrewDescription;
            serviceToUpdate.EnglishDescription = serviceDto.EnglishDescription;
            serviceToUpdate.HebrewAddendum = serviceDto.HebrewAddendum;
            serviceToUpdate.EnglishAddendum = serviceDto.EnglishAddendum;
            serviceToUpdate.ParentService = serviceDto.ParentService;
            serviceToUpdate.PictureId = serviceDto.PictureID;
            serviceToUpdate.IsActive = serviceDto.IsActive;

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
    }
}
