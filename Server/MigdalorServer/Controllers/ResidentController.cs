using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs; // Added this using directive
using System; // Added for Guid
using System.Threading.Tasks; // Added for Task

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResidentController : ControllerBase
    {
        // GET: api/<ResidentController>/residents
        [HttpGet("residents")]
        [Authorize] // Secures this endpoint, only allowing access to authenticated users.
        public async Task<IActionResult> GetAllResidents()
        {
            try
            {
                var residents = await OhResident.GetAllResidentsDetailsAsync();
                return Ok(residents);
            }
            catch (Exception e)
            {
                // Log the exception details for debugging purposes
                Console.WriteLine($"Error in GetAllResidents: {e}");
                return StatusCode(500, "An internal server error occurred while fetching residents.");
            }
        }

        // GET api/<ResidentController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<ResidentController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        /// <summary>
        /// Updates an existing resident's information.
        /// </summary>
        /// <param name="id">The GUID of the resident to update.</param>
        /// <param name="residentDto">The resident data to update.</param>
        /// <returns>An IActionResult indicating the result of the operation.</returns>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateResident(Guid id, [FromBody] UpdateResidentDto residentDto)
        {
            if (id == Guid.Empty)
            {
                return BadRequest("A valid resident ID must be provided.");
            }

            try
            {
                var success = await OhResident.UpdateResidentAsync(id, residentDto);
                if (!success)
                {
                    return NotFound($"A resident with the ID '{id}' was not found.");
                }
                return Ok("Resident updated successfully.");
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error in UpdateResident: {e}");
                return StatusCode(500, "An internal server error occurred while updating the resident.");
            }
        }

        /// <summary>
        /// Marks a resident as inactive (soft delete).
        /// </summary>
        /// <param name="id">The GUID of the resident to delete.</param>
        /// <returns>An IActionResult indicating the result of the operation.</returns>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteResident(Guid id)
        {
            if (id == Guid.Empty)
            {
                return BadRequest("A valid resident ID must be provided.");
            }
            try
            {
                var success = await OhResident.DeactivateResidentAsync(id);
                if (!success)
                {
                    return NotFound($"A resident with the ID '{id}' was not found.");
                }
                return Ok($"Resident with ID '{id}' was successfully marked as inactive.");
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error in DeleteResident: {e}");
                return StatusCode(500, "An internal server error occurred while deactivating the resident.");
            }
        }
    }
}
