using Microsoft.AspNetCore.Mvc;
using MigdalorServer.Database;
using MigdalorServer.Models;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InfoSheetController : ControllerBase
    {
        private readonly MigdalorDBContext _context;

        public InfoSheetController(MigdalorDBContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets the info sheet content for a specific language.
        /// </summary>
        /// <param name="language">The language code (e.g., "he" or "en").</param>
        /// <returns>A JSON object containing the info sheet content.</returns>
        [HttpGet("{language}")]
        [AllowAnonymous] // This content is public for all app users
        public async Task<ActionResult<object>> GetInfoSheet(string language)
        {
            if (string.IsNullOrWhiteSpace(language))
            {
                return BadRequest("Language cannot be empty.");
            }

            var infoKey = $"info_sheet_{language.ToLower()}";
            var infoSheet = await _context.OhInfoSheets.FindAsync(infoKey);

            if (infoSheet == null)
            {
                // **FIX:** Return a JSON object with an empty string
                return Ok(new { content = "" });
            }

            // **FIX:** Return a JSON object with the content
            return Ok(new { content = infoSheet.InfoValue });
        }

        /// <summary>
        /// Updates (or creates) the info sheet content for a specific language.
        /// </summary>
        /// <param name="language">The language code (e.g., "he" or "en").</param>
        /// <param name="content">The new HTML content for the info sheet.</param>
        [HttpPut("{language}")]
        [Authorize(Roles = "admin")] // Only admins can edit the info sheet
        public async Task<IActionResult> PutInfoSheet(string language, [FromBody] string content)
        {
            if (string.IsNullOrWhiteSpace(language))
            {
                return BadRequest("Language cannot be empty.");
            }

            var infoKey = $"info_sheet_{language.ToLower()}";
            var infoSheet = await _context.OhInfoSheets.FindAsync(infoKey);

            if (infoSheet == null)
            {
                // If the entry doesn't exist, create it.
                var newInfoSheet = new OhInfoSheet
                {
                    InfoKey = infoKey,
                    InfoValue = content ?? "" // Ensure content is not null
                };
                _context.OhInfoSheets.Add(newInfoSheet);
            }
            else
            {
                // If it exists, update it.
                infoSheet.InfoValue = content ?? ""; // Ensure content is not null
                _context.Entry(infoSheet).State = EntityState.Modified;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Handle potential concurrency issues if necessary
                return Conflict("The data was modified by another user. Please refresh and try again.");
            }

            return NoContent(); // Standard successful PUT response
        }
    }
}
