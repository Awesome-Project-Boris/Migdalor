using Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Migdalor.DTOs;
using MigdalorServer.Database;
using MigdalorServer.Models; 
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        /// <summary>
        /// Gets all active services and their opening hours, structured hierarchically.
        /// </summary>
        /// <returns>A list of top-level services, with sub-services nested within.</returns>
        [HttpGet("GetAllServices")]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetAllServices()
        {
            // ... (fetching logic is the same)
            var allServices = await _context.OhServices
                                            .Where(s => s.IsActive == true)
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

            // Create the DTO map with null checks
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
                    IsActive = s.IsActive ?? false,
                    OpeningHours = hoursByServiceId.GetValueOrDefault(s.ServiceId, new List<OpeningHourDto>())
                });

            // The rest of the hierarchy-building logic remains the same...
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
    }
}