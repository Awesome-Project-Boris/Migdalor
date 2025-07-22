using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Migdalor.DTOs; // Make sure this using statement points to your DTOs folder
using MigdalorServer.Database;
using MigdalorServer.Models;

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

        // GET: api/services
        /// <summary>
        /// Gets a flat list of all services.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OhService>>> GetServices()
        {
            return await _context.OhServices.AsNoTracking().ToListAsync();
        }

        // POST: api/services
        /// <summary>
        /// Creates a new service.
        /// </summary>
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

        // PUT: api/services/5
        /// <summary>
        /// Updates an existing service's details.
        /// </summary>
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

            // Map all fields from DTO to the entity
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
