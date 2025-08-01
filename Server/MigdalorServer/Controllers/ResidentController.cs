﻿using System;
using System.Security.Claims;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.InkML;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;

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
                return StatusCode(
                    500,
                    "An internal server error occurred while fetching residents."
                );
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
        public void Post([FromBody] string value) { }

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
                var person = await db
                    .OhPeople.Include(p => p.OhResident)
                    .FirstOrDefaultAsync(p => p.PersonId == id);

                if (person == null)
                {
                    return NotFound($"A person with the ID '{id}' was not found.");
                }

                var resident = person.OhResident;
                if (resident == null)
                {
                    return NotFound(
                        $"A resident record for the person with ID '{id}' was not found."
                    );
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
                resident.ResidentDescription =
                    dto.ResidentDescription ?? resident.ResidentDescription;
                resident.IsCommittee = dto.IsCommittee ?? resident.IsCommittee;
                resident.HebCommitteeName = dto.HebCommitteeName ?? resident.HebCommitteeName;
                resident.EngCommitteeName = dto.EngCommitteeName ?? resident.EngCommitteeName;

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
                return StatusCode(
                    500,
                    "An internal server error occurred while updating the resident profile."
                );
            }
        }

        [HttpPut("UpdateProfileByAdmin/{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateResidentProfileByAdmin(
            Guid id,
            [FromBody] UpdateResidentAdminDto dto
        )
        {
            if (id == Guid.Empty)
            {
                return BadRequest("A valid resident ID must be provided.");
            }

            using MigdalorDBContext db = new MigdalorDBContext();
            using var transaction = await db.Database.BeginTransactionAsync();

            try
            {
                var person = await db
                    .OhPeople.Include(p => p.OhResident)
                    .FirstOrDefaultAsync(p => p.PersonId == id);

                if (person == null)
                {
                    return NotFound($"A person with the ID '{id}' was not found.");
                }

                var resident = person.OhResident;
                if (resident == null)
                {
                    return NotFound(
                        $"A resident record for the person with ID '{id}' was not found."
                    );
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
                resident.ResidentDescription =
                    dto.ResidentDescription ?? resident.ResidentDescription;
                resident.IsCommittee = dto.IsCommittee ?? resident.IsCommittee;
                resident.HebCommitteeName = dto.HebCommitteeName ?? resident.HebCommitteeName;
                resident.EngCommitteeName = dto.EngCommitteeName ?? resident.EngCommitteeName;
                resident.ResidentApartmentNumber =
                    dto.ResidentApartmentNumber ?? resident.ResidentApartmentNumber;

                // Handle nullable Guid for SpouseId
                if (dto.SpouseId.HasValue)
                {
                    resident.SpouseId = dto.SpouseId.Value == Guid.Empty ? null : dto.SpouseId;
                }

                db.OhPeople.Update(person);
                db.OhResidents.Update(resident);
                await db.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { message = "Resident profile updated successfully by admin." });
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error in UpdateResidentProfileByAdmin: {e}");
                return StatusCode(
                    500,
                    "An internal server error occurred while updating the resident profile."
                );
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
                return Ok(new {message = $"Resident with ID '{id}' was successfully marked as inactive."});
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error in DeleteResident: {e}");
                return StatusCode(
                    500,
                    "An internal server error occurred while deactivating the resident."
                );
            }
        }

        [HttpGet("CanInitiateActivity/{id}")]
        [Authorize] // Ensures only an authenticated user can check their own permission
        public async Task<IActionResult> CanResidentInitiateActivity(Guid id)
        {
            // --- Security Check: Ensure the user is checking their own status ---
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || id.ToString() != userIdClaim)
            {
                return Forbid("You can only check your own activity initiation status.");
            }
            // --- End Security Check ---

            try
            {
                // Use a new DbContext instance, matching the pattern in this controller.
                using MigdalorDBContext db = new MigdalorDBContext();

                var resident = await db
                    .OhResidents.AsNoTracking()
                    .Where(r => r.ResidentId == id)
                    .Select(r => new { r.CanInitActivity }) // Select only the needed field
                    .FirstOrDefaultAsync();

                if (resident == null)
                {
                    return NotFound("Resident not found.");
                }

                // Return a simple JSON object like { "canInitiate": true }
                return Ok(new { canInitiate = resident.CanInitActivity });
            }
            catch (Exception ex)
            {
                // It's good practice to log the error for debugging.
                // If you have a logger injected, you can use it here.
                // For now, writing to console is fine for development.
                Console.WriteLine($"Error in CanResidentInitiateActivity: {ex.Message}");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        /// <summary>
        /// Marks a resident as active.
        /// </summary>
        /// <param name="id">The GUID of the resident to restore.</param>
        /// <returns>An IActionResult indicating the result of the operation.</returns>
        [HttpPut("Restore/{id}")]
        [Authorize]
        public async Task<IActionResult> RestoreUser(Guid id)
        {
            if (id == Guid.Empty)
            {
                return BadRequest("A valid resident ID must be provided.");
            }
            try
            {
                var success = await OhResident.RestoreUserAsync(id);
                if (!success)
                {
                    return NotFound($"A resident with the ID '{id}' was not found.");
                }
                return Ok(new {message = $"Resident with ID '{id}' was successfully marked as active." });
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error in RestoreUser: {e}");
                return StatusCode(
                    500,
                    "An internal server error occurred while activating the resident."
                );
            }
        }

        // Add this method inside the ResidentController class

        [HttpGet("CommitteeMembers")]
        public async Task<IActionResult> GetCommitteeMembers()
        {
            try
            {
                using MigdalorDBContext db = new MigdalorDBContext();

                var committeeMembers = await db
                    .OhResidents.Where(r => r.IsCommittee == true && r.IsActive == true)
                    .Join(
                        db.OhPeople, // Join with OhPeople to get names
                        resident => resident.ResidentId,
                        person => person.PersonId,
                        (resident, person) => new { resident, person }
                    )
                    .GroupJoin(
                        db.OhPictures, // Left Join with OhPictures for the photo
                        combined => combined.person.ProfilePicId,
                        picture => picture.PicId,
                        (combined, pictures) =>
                            new
                            {
                                combined.resident,
                                combined.person,
                                pictures,
                            }
                    )
                    .SelectMany(
                        x => x.pictures.DefaultIfEmpty(),
                        (x, picture) =>
                            new CommitteeMemberDto
                            {
                                UserId = x.person.PersonId,
                                HebName = x.person.HebFirstName + " " + x.person.HebLastName,
                                EngName = x.person.EngFirstName + " " + x.person.EngLastName,
                                HebCommitteeTitle = x.resident.HebCommitteeName,
                                EngCommitteeTitle = x.resident.EngCommitteeName,
                                PhotoUrl = picture != null ? picture.PicPath : null,
                            }
                    )
                    .ToListAsync();

                return Ok(committeeMembers);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error in GetCommitteeMembers: {e}");
                return StatusCode(
                    500,
                    "An internal server error occurred while fetching committee members."
                );
            }
        }
        [HttpPut("{id}/spouse")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateSpouse(Guid id, [FromBody] UpdateSpouseDto dto)
        {
            if (id == Guid.Empty)
            {
                // Return a JSON object for all responses
                return BadRequest(new { message = "יש לספק מזהה דייר תקין." });
            }

            using var db = new MigdalorDBContext();
            using var transaction = await db.Database.BeginTransactionAsync();

            try
            {
                var personToUpdate = await db
                    .OhPeople.Include(p => p.OhResident)
                    .FirstOrDefaultAsync(p => p.PersonId == id);

                if (personToUpdate == null || personToUpdate.OhResident == null)
                {
                    await transaction.RollbackAsync();
                    return NotFound(new { message = $"דייר עם המזהה '{id}' לא נמצא." });
                }
                var residentToUpdate = personToUpdate.OhResident;

                Guid? oldSpouseId = residentToUpdate.SpouseId;
                Guid? newSpouseId = dto.SpouseId;

                if (oldSpouseId == newSpouseId)
                {
                    await transaction.CommitAsync();
                    return Ok(new { message = "פרטי בן/בת הזוג כבר מעודכנים." });
                }

                if (oldSpouseId.HasValue)
                {
                    var oldSpouse = await db.OhResidents.FirstOrDefaultAsync(r =>
                        r.ResidentId == oldSpouseId.Value
                    );
                    if (oldSpouse != null)
                    {
                        oldSpouse.SpouseId = null;
                        oldSpouse.SpouseHebName = null;
                        oldSpouse.SpouseEngName = null;
                        db.OhResidents.Update(oldSpouse);
                    }
                }

                if (newSpouseId.HasValue && newSpouseId != Guid.Empty)
                {
                    var newSpousePerson = await db
                        .OhPeople.Include(p => p.OhResident)
                        .FirstOrDefaultAsync(p => p.PersonId == newSpouseId.Value);

                    if (newSpousePerson == null || newSpousePerson.OhResident == null)
                    {
                        await transaction.RollbackAsync();
                        return NotFound(new { message = $"בן/בת הזוג החדש עם מזהה '{newSpouseId}' לא נמצא." });
                    }
                    var newSpouseResident = newSpousePerson.OhResident;

                    if (newSpouseResident.SpouseId.HasValue && newSpouseResident.SpouseId != id)
                    {
                        await transaction.RollbackAsync();
                        return StatusCode(409, new { message = "בן/בת הזוג שנבחר/ה כבר משויך/ת לדייר אחר." });
                    }

                    residentToUpdate.SpouseId = newSpouseId;
                    residentToUpdate.SpouseHebName =
                        $"{newSpousePerson.HebFirstName} {newSpousePerson.HebLastName}";
                    residentToUpdate.SpouseEngName =
                        $"{newSpousePerson.EngFirstName} {newSpousePerson.EngLastName}";
                    db.OhResidents.Update(residentToUpdate);

                    newSpouseResident.SpouseId = id;
                    newSpouseResident.SpouseHebName =
                        $"{personToUpdate.HebFirstName} {personToUpdate.HebLastName}";
                    newSpouseResident.SpouseEngName =
                        $"{personToUpdate.EngFirstName} {personToUpdate.EngLastName}";
                    db.OhResidents.Update(newSpouseResident);
                }
                else
                {
                    residentToUpdate.SpouseId = null;
                    residentToUpdate.SpouseHebName = null;
                    residentToUpdate.SpouseEngName = null;
                    db.OhResidents.Update(residentToUpdate);
                }

                await db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "פרטי בן/בת הזוג עודכנו בהצלחה." });
            }
            catch (Exception e)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error in UpdateSpouse: {e}");
                return StatusCode(
                    500,
                    new { message = "אירעה שגיאת שרת פנימית בעת עדכון פרטי בן/בת הזוג." }
                );
            }
        }

        [HttpGet("subscriptions/{residentId}")]
        public async Task<IActionResult> GetResidentSubscriptions(Guid residentId)
        {
            // Using your per-request DbContext pattern
            using var context = new MigdalorDBContext();
            try
            {
                // Check if the resident exists
                var resident = await context.OhResidents.FindAsync(residentId);
                if (resident == null)
                {
                    return NotFound(new { message = "Resident not found" });
                }

                // Fetch all categories and join with the resident's subscriptions
                // Using the exact EF model names (e.g., OhCategories, OhResidentCategorySubscriptions)
                var subscriptions = await context.OhCategories
                    .Select(category => new {
                        category.CategoryHebName,
                        category.CategoryColor,
                        // Left join to get the subscription status, defaulting to true if not found.
                        isSubscribed = context.OhResidentCategorySubscriptions
                                        .Where(s => s.ResidentId == residentId && s.CategoryHebName == category.CategoryHebName)
                                        .Select(s => (bool?)s.IsSubscribed) // Select as nullable bool
                                        .FirstOrDefault() ?? true // Default to true if no entry exists
                    })
                    .ToListAsync();

                return Ok(subscriptions);
            }
            catch (Exception ex)
            {
                // You should log the exception details here
                return StatusCode(500, new { message = "Internal Server Error", error = ex.Message });
            }
        }

        // PUT: api/Resident/subscriptions
        // Updates a resident's subscription status for a specific category.
        [HttpPut("subscriptions")]
        public async Task<IActionResult> UpdateResidentSubscription([FromBody] SubscriptionUpdateDto subscriptionUpdate)
        {
            if (subscriptionUpdate == null || string.IsNullOrEmpty(subscriptionUpdate.CategoryHebName))
            {
                return BadRequest("Invalid subscription data provided.");
            }

            // Using your per-request DbContext pattern
            using var context = new MigdalorDBContext();
            try
            {
                // Find the existing subscription using the correct property names
                var subscription = await context.OhResidentCategorySubscriptions.FirstOrDefaultAsync(s =>
                    s.ResidentId == subscriptionUpdate.ResidentId &&
                    s.CategoryHebName == subscriptionUpdate.CategoryHebName);

                if (subscription != null)
                {
                    // If it exists, update it
                    subscription.IsSubscribed = subscriptionUpdate.IsSubscribed;
                    context.OhResidentCategorySubscriptions.Update(subscription);
                }
                else
                {
                    // If it doesn't exist, create a new entry
                    // Using the correct class name 'OhResidentCategorySubscription'
                    var newSubscription = new OhResidentCategorySubscription
                    {
                        ResidentId = subscriptionUpdate.ResidentId,
                        CategoryHebName = subscriptionUpdate.CategoryHebName,
                        IsSubscribed = subscriptionUpdate.IsSubscribed
                    };
                    context.OhResidentCategorySubscriptions.Add(newSubscription);
                }

                await context.SaveChangesAsync();
                return Ok(new { message = "Subscription updated successfully." });
            }
            catch (Exception ex)
            {
                // You should log the exception details here
                return StatusCode(500, new { message = "Failed to update subscription", error = ex.Message });
            }
        }
    }
}
