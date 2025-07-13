using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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
        private readonly IConfiguration _configuration;

        // Injected IConfiguration to access JWT settings from appsettings.json
        public PeopleController(MigdalorDBContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("InstructorDetails")]
        [Authorize]
        public async Task<IActionResult> GetInstructorDetails()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                return Unauthorized("Invalid token.");
            }

            var instructor = await _context.OhPeople
                .Where(p => p.PersonId == userId && p.PersonRole == "Instructor")
                .Select(p => new
                {
                    p.PersonId,
                    p.PhoneNumber,
                    p.HebFirstName,
                    p.HebLastName,
                    p.EngFirstName,
                    p.EngLastName,
                    p.Gender,
                    p.Email,
                    p.DateOfBirth,
                    ProfilePicture = _context.OhPictures
                                       .Where(pic => pic.PicId == p.ProfilePicId)
                                       .Select(pic => new { pic.PicId, pic.PicPath, pic.PicAlt })
                                       .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (instructor == null)
            {
                return Forbid("User is not an instructor or not found.");
            }

            // Construct a full name for convenience
            var response = new
            {
                id = instructor.PersonId,
                phoneNumber = instructor.PhoneNumber,
                hebName = $"{instructor.HebFirstName} {instructor.HebLastName}".Trim(),
                engName = $"{instructor.EngFirstName} {instructor.EngLastName}".Trim(),
                gender = instructor.Gender,
                email = instructor.Email,
                dateOfBirth = instructor.DateOfBirth,
                profilePicture = instructor.ProfilePicture
            };

            return Ok(response);
        }

        [HttpPut("UpdateInstructorProfile")]
        [Authorize]
        public async Task<IActionResult> UpdateInstructorProfile([FromBody] UpdateInstructorProfileDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId) || userId != dto.PersonId)
            {
                return Unauthorized("Invalid token or mismatched user ID.");
            }

            var person = await _context.OhPeople.FirstOrDefaultAsync(p => p.PersonId == userId && p.PersonRole == "Instructor");

            if (person == null)
            {
                return Forbid("User is not an instructor or not found.");
            }

            // Update fields
            person.PhoneNumber = dto.PhoneNumber;
            person.Email = dto.Email;
            person.ProfilePicId = dto.ProfilePicId;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent(); // Success
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the profile.");
            }
        }

        // POST: api/People/login
        // This method now authenticates the user and returns a JWT.
        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLogin userLogin)
        {
            try
            {
                OhPerson user = OhPerson.AuthenticateUser(userLogin);
                var token = GenerateJwtToken(user);
                return Ok(token); // Return the token string directly
            }
            catch (Exception e)
            {
                if (e.Message == "User not found")
                    return NotFound("User Not Found");
                if (e.Message == "Wrong password")
                    return Unauthorized("Wrong Password");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error Logging In: {e.InnerException?.Message ?? e.Message}"
                );
            }
        }

        // POST: api/People/refresh-token
        // Refreshes the JWT for an authenticated user.
        [HttpPost("refresh-token")]
        [Authorize] // Ensures only users with a valid token can access this
        public IActionResult RefreshToken()
        {
            try
            {
                // Get the user ID from the claims inside the existing JWT
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized("Invalid token: Missing user identifier.");
                }

                if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
                {
                    return BadRequest("Invalid user ID format in token.");
                }

                // Fetch the user from the database to ensure they still exist and are valid
                var user = OhPerson.GetUserByID(userId);
                if (user == null)
                {
                    // This case handles if the user was deleted after the token was issued.
                    return Unauthorized("User not found.");
                }

                // Generate a new token with a new expiration date
                var newToken = GenerateJwtToken(user);
                return Ok(newToken);
            }
            catch (Exception e)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error refreshing token: {e.InnerException?.Message ?? e.Message}"
                );
            }
        }


        // GET: api/People/IsAdmin
        // This endpoint is now protected and checks the role of the authenticated user.
        [HttpGet("IsAdmin")]
        [Authorize] // Ensures only authenticated users can access this
        public IActionResult IsAdmin()
        {
            try
            {
                // Get the user ID from the claims inside the JWT
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized("Invalid token: Missing user identifier.");
                }

                if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
                {
                    return BadRequest("Invalid user ID format in token.");
                }

                return Ok(OhPerson.IsAdmin(userId));
            }
            catch (Exception e)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error Checking Admin Status: {e.InnerException?.Message ?? e.Message}"
                );
            }
        }

        [HttpGet("LoginDetails")]
        [Authorize]
        public IActionResult GetPersonDetailsForLogin()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized("Invalid token.");
                }

                if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
                {
                    return BadRequest("Invalid user ID in token.");
                }

                //var data = OhPerson.GetPersonByIDForProfile(userId);
                //return Ok(data);

                // Get the base profile data
                var data = OhPerson.GetPersonByIDForProfile(userId);
                if (data == null)
                {
                    return NotFound("User profile data not found.");
                }

                // Separately, find the person record to get the role
                var person = _context.OhPeople.Find(userId);
                if (person == null)
                {
                    return NotFound("User record not found.");
                }

                // Convert the profile data to a flexible dictionary to add the new property
                var json = JsonSerializer.Serialize(data);
                var dictionary = JsonSerializer.Deserialize<Dictionary<string, object>>(json);

                // Add the personRole to the dictionary
                dictionary["personRole"] = person.PersonRole;

                // Return the combined data
                return Ok(dictionary);
            }
            catch (Exception e)
            {
                if (e.Message == "User not found")
                    return NotFound("User Not Found");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error getting user data: {e.InnerException?.Message ?? e.Message}"
                );
            }
        }

        // GET: api/People/details
        // This endpoint gets details for the currently logged-in user from their token.
        [HttpGet("details/{userId}")]
        public IActionResult GetPersonDetailsForProfile(Guid userId)
        {
            try
            {

                var data = OhPerson.GetPersonByIDForProfile(userId);
                return Ok(data);
            }
            catch (Exception e)
            {
                if (e.Message == "User not found")
                    return NotFound("User Not Found");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error getting user data: {e.InnerException?.Message ?? e.Message}"
                );
            }
        }

        // Helper method to generate the JWT
        private string GenerateJwtToken(OhPerson user)
        {
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])
            );
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.PersonId.ToString()),
                new Claim(ClaimTypes.Name, user.PhoneNumber),
                new Claim(ClaimTypes.GivenName, user.EngFirstName ?? ""),
                new Claim(ClaimTypes.Surname, user.EngLastName ?? ""),
                new Claim(ClaimTypes.Role, user.PersonRole ?? "User"), // Add role claim, default to "User"
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(168), // Set token expiration to 7 days
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // --- Other existing methods ---

        [HttpGet("AdminDetails")]
        [Authorize]
        public IActionResult GetAdminDetails()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized("Invalid token.");
                }

                if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
                {
                    return BadRequest("Invalid user ID in token.");
                }

                var data = OhPerson.GetUserByID(userId);
                return Ok(data);
            }
            catch (Exception e)
            {
                if (e.Message == "User not found")
                    return NotFound("User Not Found");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error getting user data: {e.InnerException?.Message ?? e.Message}"
                );
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OhPerson>>> GetAllPeople()
        {
            var people = await _context.OhPeople.ToListAsync();
            return Ok(people);
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] UserRegister user)
        {
            try
            {
                var newUser = OhPerson.AddUser(user);
                return Ok(newUser);
            }
            catch (Exception e)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error Registering User: {e.InnerException?.Message ?? e.Message}"
                );
            }
        }

        [HttpGet("ActiveDigests")]
        public async Task<ActionResult<IEnumerable<ResidentDigest>>> GetActiveResidentDigests()
        {
            try
            {
                // 1. Get the original list of all active user digests
                var allDigests = await OhPerson.GetActiveResidentDigestsAsync(_context);

                // 2. Get the IDs of all users from that list
                var userIds = allDigests.Select(d => d.UserId).ToList();

                // 3. Find which of those IDs belong to a "Resident" or have a null role
                var residentIds = await _context.OhPeople
                    .Where(p => userIds.Contains(p.PersonId) && (p.PersonRole == "Resident" || p.PersonRole == null))
                    .Select(p => p.PersonId)
                    .ToListAsync();

                // 4. Filter the original digest list to only include residents
                var filteredDigests = allDigests.Where(d => residentIds.Contains(d.UserId)).ToList();

                return Ok(filteredDigests);
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
                );
            }
        }

        [HttpPut("UpdateProfile/{id}")]
        // public IActionResult UpdateProfile(Guid id, [FromBody] UpdateProfileDto dto) // changed to the method below to save privacy settings
        public IActionResult UpdateProfile(Guid id, [FromBody] UpdateProfileRequestDto dto)
        {

            // --- ADD THIS LOGGING BLOCK ---
            var options = new JsonSerializerOptions { WriteIndented = true };
            Console.WriteLine("--- RECEIVED UpdateProfile DTO ---");
            Console.WriteLine(JsonSerializer.Serialize(dto, options));
            Console.WriteLine("----------------------------------");
            // --- END LOGGING BLOCK ---

            // Changed from db to _context to fix saving privacy settings 
            //using var db = new MigdalorDBContext();
            //var person = db.OhPeople.Find(id);
            var person = _context.OhPeople.Find(id);
            if (person == null)
                return NotFound("Person not found."); // Changed: NotFound()

            //var resident = db.OhResidents.SingleOrDefault(r => r.ResidentId == id);
            var resident = _context.OhResidents
                             .Include(r => r.InterestNames)
                             .SingleOrDefault(r => r.ResidentId == id);
            if (resident == null)
                return NotFound("Resident not found."); // Changed: NotFound()

            if (id != dto.PersonId)
            {
                return BadRequest("Mismatched ID in URL and request body.");
            }

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
                        //if (!db.OhInterests.Any(i => i.InterestName == newName))
                        if (!_context.OhInterests.Any(i => i.InterestName == newName))
                        {
                            _context.OhInterests.Add(new OhInterest { InterestName = newName });
                            //db.OhInterests.Add(new OhInterest { InterestName = newName });
                        }
                    }
                    _context.SaveChanges();
                    //db.SaveChanges();
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
                    //var interestsToLink = db.OhInterests
                    var interestsToLink = _context.OhInterests
                                            .Where(i => allSelectedNames.Contains(i.InterestName))
                                            .ToList();

                    foreach (var interest in interestsToLink)
                    {
                        resident.InterestNames.Add(interest);
                    }
                }
            }

            if (dto.PrivacySettings != null)
            {
                var existingSettings = _context.OhPrivacySettings.Find(id);
                if (existingSettings != null)
                {
                    // If settings exist, update them
                    existingSettings.ShowPartner = dto.PrivacySettings.ShowPartner;
                    existingSettings.ShowApartmentNumber = dto.PrivacySettings.ShowApartmentNumber;
                    existingSettings.ShowMobilePhone = dto.PrivacySettings.ShowMobilePhone;
                    existingSettings.ShowEmail = dto.PrivacySettings.ShowEmail;
                    existingSettings.ShowArrivalYear = dto.PrivacySettings.ShowArrivalYear;
                    existingSettings.ShowOrigin = dto.PrivacySettings.ShowOrigin;
                    existingSettings.ShowProfession = dto.PrivacySettings.ShowProfession;
                    existingSettings.ShowInterests = dto.PrivacySettings.ShowInterests;
                    existingSettings.ShowAboutMe = dto.PrivacySettings.ShowAboutMe;
                    existingSettings.ShowProfilePicture = dto.PrivacySettings.ShowProfilePicture;
                    existingSettings.ShowAdditionalPictures = dto.PrivacySettings.ShowAdditionalPictures;
                }
                else
                {
                    // If settings don't exist, create a new record
                    var newSettings = new OhPrivacySetting
                    {
                        PersonId = id,
                        ShowPartner = dto.PrivacySettings.ShowPartner,
                        ShowApartmentNumber = dto.PrivacySettings.ShowApartmentNumber,
                        ShowMobilePhone = dto.PrivacySettings.ShowMobilePhone,
                        ShowEmail = dto.PrivacySettings.ShowEmail,
                        ShowArrivalYear = dto.PrivacySettings.ShowArrivalYear,
                        ShowOrigin = dto.PrivacySettings.ShowOrigin,
                        ShowProfession = dto.PrivacySettings.ShowProfession,
                        ShowInterests = dto.PrivacySettings.ShowInterests,
                        ShowAboutMe = dto.PrivacySettings.ShowAboutMe,
                        ShowProfilePicture = dto.PrivacySettings.ShowProfilePicture,
                        ShowAdditionalPictures = dto.PrivacySettings.ShowAdditionalPictures
                    };
                    _context.OhPrivacySettings.Add(newSettings);
                }
            }

            //db.SaveChanges();
            _context.SaveChanges();
            return NoContent(); // Changed: return 204 on success
        }

        // GET: api/People/PrivacySettings/{id}
        [HttpGet("PrivacySettings/{id}")]
        public ActionResult<PrivacySettingsDto> GetPrivacySettings(Guid id)
        {
            var settings = _context.OhPrivacySettings
                .AsNoTracking()
                .FirstOrDefault(ps => ps.PersonId == id);
            if (settings == null)
            {
                return Ok(new PrivacySettingsDto());
            }
            var settingsDto = new PrivacySettingsDto
            {
                ShowPartner = settings.ShowPartner ?? true,
                ShowApartmentNumber = settings.ShowApartmentNumber ?? true,
                ShowMobilePhone = settings.ShowMobilePhone ?? true,
                ShowEmail = settings.ShowEmail ?? true,
                ShowArrivalYear = settings.ShowArrivalYear ?? true,
                ShowOrigin = settings.ShowOrigin ?? true,
                ShowProfession = settings.ShowProfession ?? true,
                ShowInterests = settings.ShowInterests ?? true,
                ShowAboutMe = settings.ShowAboutMe ?? true,
                ShowProfilePicture = settings.ShowProfilePicture ?? true,
                ShowAdditionalPictures = settings.ShowAdditionalPictures ?? true,
            };
            return Ok(settingsDto);
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

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var person = _context.OhPeople.Find(id);
            if (person == null)
                return NotFound();
            _context.OhPeople.Remove(person);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
