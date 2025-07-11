using DocumentFormat.OpenXml.InkML;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;
using System;
using System.Threading.Tasks;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResidentController : ControllerBase
    {

        // GET: api/<ResidentController>/residents
        [HttpGet("residents")]
        [Authorize]
        public async Task<IActionResult> GetAllResidents()
        {
            try
            {
                var residents = await OhResident.GetAllResidentsDetailsAsync();
                return Ok(residents);
            }
            catch (Exception e)
            {
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
        /// Updates an existing resident's profile information across OH_People and OH_Residents tables.
        /// </summary>
        /// <param name="id">The GUID of the person to update.</param>
        /// <param name="dto">The data transfer object containing the updated information.</param>
        /// <returns>An IActionResult indicating the result of the operation.</returns>
        [HttpPut("UpdateProfile/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateResident(Guid id, [FromBody] UpdateResidentDto dto)
        {
            if (id == Guid.Empty)
            {
                return BadRequest("A valid resident ID must be provided.");
            }

            // Use a transaction to ensure that updates to both tables either all succeed or all fail.
            using MigdalorDBContext db = new MigdalorDBContext();
            using var transaction = await db.Database.BeginTransactionAsync();

            try
            {
                // Find the person and their corresponding resident record.
                // Include both to ensure they are tracked by Entity Framework.
                var person = await db.OhPeople
                                           .Include(p => p.OhResident)
                                           .FirstOrDefaultAsync(p => p.PersonId == id);

                if (person == null)
                {
                    return NotFound($"A person with the ID '{id}' was not found.");
                }

                var resident = person.OhResident;
                if (resident == null)
                {
                    return NotFound($"A resident record for the person with ID '{id}' was not found.");
                }

                // === Update OH_People table fields ===
                person.HebFirstName = dto.HebFirstName ?? person.HebFirstName;
                person.HebLastName = dto.HebLastName ?? person.HebLastName;
                person.EngFirstName = dto.EngFirstName ?? person.EngFirstName;
                person.EngLastName = dto.EngLastName ?? person.EngLastName;
                person.Email = dto.Email ?? person.Email;
                person.PhoneNumber = dto.PhoneNumber ?? person.PhoneNumber;
                person.DateOfBirth = dto.DateOfBirth ?? person.DateOfBirth;
                person.Gender = dto.Gender ?? person.Gender;
                person.PersonRole = dto.PersonRole ?? person.PersonRole;
                person.ProfilePicId = dto.ProfilePicId ?? person.ProfilePicId;


                // === Update OH_Residents table fields ===
                resident.BranchName = dto.BranchName ?? resident.BranchName;
                resident.IsBokerTov = dto.IsBokerTov ?? resident.IsBokerTov;
                resident.CanInitActivity = dto.CanInitActivity ?? resident.CanInitActivity;
                resident.DateOfArrival = dto.DateOfArrival ?? resident.DateOfArrival;
                resident.HomePlace = dto.HomePlace ?? resident.HomePlace;
                resident.Profession = dto.Profession ?? resident.Profession;
                resident.ResidentDescription = dto.ResidentDescription ?? resident.ResidentDescription;

                // Handle nullable Guid for SpouseId
                if (dto.SpouseId.HasValue)
                {
                    resident.SpouseId = dto.SpouseId.Value == Guid.Empty ? null : dto.SpouseId;
                }


                // Mark the entities as modified and save changes
                db.OhPeople.Update(person);
                db.OhResidents.Update(resident);
                await db.SaveChangesAsync();

                // If everything is successful, commit the transaction
                await transaction.CommitAsync();

                return Ok(new { message = "Resident profile updated successfully." });
            }
            catch (Exception e)
            {
                // If any error occurs, the transaction will be rolled back automatically when 'using' block is exited.
                Console.WriteLine($"Error in UpdateResident: {e}");
                return StatusCode(500, "An internal server error occurred while updating the resident profile.");
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
                // This static method should ideally be moved into a service that uses _context
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
