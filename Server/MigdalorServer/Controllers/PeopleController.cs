using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PeopleController : ControllerBase
    {
        private readonly MigdalorDBContext _context;

        public PeopleController(MigdalorDBContext context)
        {
            _context = context;
        }

        // GET: api/People
        // Changed from minimal API style to classic Web API: returns ActionResult<IEnumerable<OhPerson>>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OhPerson>>> GetAllPeople()
        {
            var people = await _context.OhPeople.ToListAsync();
            return Ok(people); // Changed: use Ok() to wrap result
        }

        // GET: api/People/GetPersonByIDForProfile/{id}
        // Kept signature similar but return type is IActionResult for classic style
        [HttpGet("GetPersonByIDForProfile/{id}")]
        public IActionResult GetPersonByIDForProfile(Guid id)
        {
            try
            {
                var data = OhPerson.GetPersonByIDForProfile(id);
                return Ok(data); // Changed: use Ok() for 200
            }
            catch (Exception e)
            {
                if (e.Message == "User not found")
                    return NotFound("User Not Found"); // Changed: return NotFound() for 404
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error getting user data: {e.InnerException?.Message ?? e.Message}"
                ); // Changed: classic error handling
            }
        }

        // POST: api/People/register
        // Changed to IActionResult and uses Ok() for result
        [HttpPost("register")]
        public IActionResult Register([FromBody] UserRegister user)
        {
            try
            {
                var newUser = OhPerson.AddUser(user);
                return Ok(newUser); // Changed: wrap in Ok()
            }
            catch (Exception e)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error Registering User: {e.InnerException?.Message ?? e.Message}"
                ); // Changed: classic error
            }
        }

        // POST: api/People/login
        // Changed to return IActionResult for conventional API
        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLogin userLogin)
        {
            try
            {
                OhPerson user = OhPerson.AuthenticateUser(userLogin);
                return Ok(
                    new
                    {
                        user.PersonId,
                        user.HebFirstName,
                        user.HebLastName,
                        user.EngFirstName,
                        user.EngLastName,
                    }
                ); // Changed: Ok() with object result
            }
            catch (Exception e)
            {
                if (e.Message == "User not found")
                    return NotFound("User Not Found"); // Changed: NotFound()
                if (e.Message == "Wrong password")
                    return Unauthorized("Wrong Password"); // Changed: Unauthorized()
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error Logging In: {e.InnerException?.Message ?? e.Message}"
                ); // Changed: classic error
            }
        }

        // GET: api/People/ActiveDigests
        // Changed signature to ActionResult<IEnumerable<ResidentDigest>> and use Ok()
        [HttpGet("ActiveDigests")]
        public async Task<ActionResult<IEnumerable<ResidentDigest>>> GetActiveResidentDigests()
        {
            try
            {
                var digests = await OhPerson.GetActiveResidentDigestsAsync(_context);
                return Ok(digests); // Changed: Ok() result
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "An error occurred while fetching resident digests.",
                        error = ex.Message,
                    }
                ); // Changed: classic error
            }
        }

        // GET: api/People/isadmin/{userId}
        // Changed to IActionResult and use Ok() to return boolean
        [HttpGet("isadmin/{userId}")]
        public IActionResult IsAdmin(Guid userId)
        {
            try
            {
                return Ok(OhPerson.IsAdmin(userId)); // Changed: Ok() with boolean
            }
            catch (Exception e)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error Checking Admin Status: {e.InnerException?.Message ?? e.Message}"
                ); // Changed: classic error
            }
        }

        // PUT: api/People/UpdateProfile/{id}
        // Changed to IActionResult and return NoContent() on success
        [HttpPut("UpdateProfile/{id}")]
        public IActionResult UpdateProfile(Guid id, [FromBody] UpdateProfileDto dto)
        {

            // --- ADD THIS LOGGING BLOCK ---
            var options = new JsonSerializerOptions { WriteIndented = true };
            Console.WriteLine("--- RECEIVED UpdateProfile DTO ---");
            Console.WriteLine(JsonSerializer.Serialize(dto, options));
            Console.WriteLine("----------------------------------");
            // --- END LOGGING BLOCK ---

            using var db = new MigdalorDBContext();

            var person = db.OhPeople.Find(id);
            if (person == null)
                return NotFound("Person not found.");

            var resident = db.OhResidents
                             .Include(r => r.InterestNames)
                             .SingleOrDefault(r => r.ResidentId == id);
            if (resident == null)
                return NotFound("Resident not found.");

            // --- Update Standard Fields ---
            person.PhoneNumber = dto.MobilePhone;
            person.Email = dto.Email;
            resident.HomePlace = dto.Origin;
            resident.Profession = dto.Profession;
            resident.ResidentDescription = dto.AboutMe;
            resident.ResidentApartmentNumber = dto.ResidentApartmentNumber;

            person.ProfilePicId = dto.ProfilePicture?.PicID;
            resident.AdditionalPic1Id = dto.AdditionalPicture1?.PicID;
            resident.AdditionalPic2Id = dto.AdditionalPicture2?.PicID;

            // --- ✅ CORRECTED: Handle Interests Conditionally ---

            // Only modify interests if the client actually sent data for them.
            bool interestsWereEdited = (dto.InterestNames != null && dto.InterestNames.Any()) ||
                                       (dto.NewInterestNames != null && dto.NewInterestNames.Any());

            if (interestsWereEdited)
            {
                // 1. Add any new interests to the main OH_Interests table
                if (dto.NewInterestNames != null && dto.NewInterestNames.Any())
                {
                    foreach (var newName in dto.NewInterestNames)
                    {
                        if (!db.OhInterests.Any(i => i.InterestName == newName))
                        {
                            db.OhInterests.Add(new OhInterest { InterestName = newName });
                        }
                    }
                    db.SaveChanges();
                }

                // 2. Clear the user's existing interests
                resident.InterestNames.Clear();

                // 3. Link all selected interests (both old and new) to the user
                var allSelectedNames = (dto.InterestNames ?? new List<string>())
                                        .Concat(dto.NewInterestNames ?? new List<string>())
                                        .Distinct()
                                        .ToList();

                if (allSelectedNames.Any())
                {
                    var interestsToLink = db.OhInterests
                                            .Where(i => allSelectedNames.Contains(i.InterestName))
                                            .ToList();

                    foreach (var interest in interestsToLink)
                    {
                        resident.InterestNames.Add(interest);
                    }
                }
            }

            // --- Save All Changes ---
            db.SaveChanges();
            return NoContent();
        }

        [HttpPost("SearchByInterests")]
        public async Task<IActionResult> SearchByInterests([FromBody] List<string> interestNames)
        {
            using var db = new MigdalorDBContext();

            // If the list is null or empty, return all active residents.
            if (interestNames == null || !interestNames.Any())
            {
                var allDigests = await OhPerson.GetActiveResidentDigestsAsync(db);
                return Ok(allDigests);
            }

            // ✅ STEP 1: Fetch all residents and their interests into memory first.
            // This is the key change. .ToList() executes the query and avoids the translation error.
            var allResidentsWithInterests = db.OhResidents
                .Include(r => r.InterestNames)
                .ToList();

            // ✅ STEP 2: Now, filter the in-memory list using standard C#.
            // This logic is the same as before, but now it runs on the C# list, not against the database.
            var residentIds = allResidentsWithInterests
                .Where(resident => interestNames.All(requiredName =>
                    resident.InterestNames.Any(residentInterest => residentInterest.InterestName == requiredName)
                ))
                .Select(resident => resident.ResidentId)
                .ToList();

            // If no residents match, return an empty list.
            if (!residentIds.Any())
            {
                return Ok(new List<ResidentDigest>());
            }

            // ✅ STEP 3: Proceed as before.
            // Fetch the digests and filter them by the IDs you found.
            var allActiveDigests = await OhPerson.GetActiveResidentDigestsAsync(db);
            var filteredDigests = allActiveDigests
                                    .Where(digest => residentIds.Contains(digest.UserId))
                                    .ToList();

            return Ok(filteredDigests);
        }

        // DELETE: api/People/{id}
        // Changed to IActionResult and return NoContent() on delete
        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var person = _context.OhPeople.Find(id);
            if (person == null)
                return NotFound(); // Changed: NotFound()
            _context.OhPeople.Remove(person);
            _context.SaveChanges();
            return NoContent(); // Changed: return 204
        }
    }
}
