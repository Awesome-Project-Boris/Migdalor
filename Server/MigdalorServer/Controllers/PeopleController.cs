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
using System.ComponentModel.DataAnnotations;
using MigdalorServer.BL;

namespace MigdalorServer.Controllers
{
    // DTO for the reset password request
    public class ResetPasswordDto
    {
        [Required]
        public string NewPassword { get; set; }
    }

    // DTO for Admin Registration, includes Role
    public class AdminRegisterDto
    {
        [Required]
        public string PhoneNumber { get; set; }
        [Required]
        public string HebFirstName { get; set; }
        [Required]
        public string HebLastName { get; set; }
        public string? EngFirstName { get; set; }
        public string? EngLastName { get; set; }
        public string Gender { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public string Role { get; set; }
    }

    // DTO for updating a user's role
    public class UpdateRoleDto
    {
        [Required]
        public string Role { get; set; }
    }


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

        // NEW: Endpoint to update a user's role
        [HttpPut("UpdateRole/{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleDto dto)
        {
            var person = await _context.OhPeople.FindAsync(id);
            if (person == null)
            {
                return NotFound("User not found.");
            }

            person.PersonRole = dto.Role;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // NEW: Endpoint to get all staff/admin users
        [HttpGet("admins")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAdmins()
        {
            var admins = await _context.OhPeople
                .Where(p => p.PersonRole != null && p.PersonRole != "Resident")
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
                    p.PersonRole
                })
                .ToListAsync();

            return Ok(admins);
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
        public async Task<IActionResult> GetPersonDetailsForLogin()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (!Guid.TryParse(userIdClaim?.Value, out Guid userId))
                {
                    return Unauthorized("Invalid token.");
                }

                var person = await _context.OhPeople.FindAsync(userId);

                if (person == null)
                {
                    return NotFound("User record associated with this token was not found.");
                }

                // Manually construct the response object directly from the OH_People table.
                // This works for ALL roles.
                var responseData = new
                {
                    id = person.PersonId,
                    hebName = $"{person.HebFirstName} {person.HebLastName}".Trim(),
                    engName = $"{person.EngFirstName} {person.EngLastName}".Trim(),
                    personRole = person.PersonRole
                };

                return Ok(responseData);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error getting user login details: {e.Message}");
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

        [HttpGet("InstructorDetails/{userId}")]
        public async Task<IActionResult> GetInstructorDetailsById(Guid userId)
        {
            try
            {
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
                        p.Email,
                        ProfilePicture = _context.OhPictures
                                           .Where(pic => pic.PicId == p.ProfilePicId)
                                           .Select(pic => new { pic.PicId, pic.PicPath, pic.PicAlt })
                                           .FirstOrDefault()
                    })
                    .FirstOrDefaultAsync();

                if (instructor == null)
                {
                    return NotFound("An instructor with the specified ID was not found.");
                }

                // Construct a clean response object
                var response = new
                {
                    id = instructor.PersonId,
                    phoneNumber = instructor.PhoneNumber,
                    hebName = $"{instructor.HebFirstName} {instructor.HebLastName}".Trim(),
                    engName = $"{instructor.EngFirstName} {instructor.EngLastName}".Trim(),
                    email = instructor.Email,
                    profilePicture = instructor.ProfilePicture
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred.", error = ex.Message });
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
                expires: DateTime.Now.AddHours(1440), // Set token expiration to 7 days
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
        //[Authorize(Roles = "admin")]
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

        [HttpPost("RegisterAdmin")]
        [Authorize(Roles = "admin")]
        public IActionResult RegisterAdmin([FromBody] AdminRegisterDto adminData)
        {
            try
            {
                if (_context.OhPeople.Any(p => p.PhoneNumber == adminData.PhoneNumber))
                {
                    return Conflict("A user with this phone number already exists.");
                }

                var newAdmin = new OhPerson
                {
                    PersonId = Guid.NewGuid(),
                    PhoneNumber = adminData.PhoneNumber,
                    HebFirstName = adminData.HebFirstName,
                    HebLastName = adminData.HebLastName,
                    EngFirstName = adminData.EngFirstName,
                    EngLastName = adminData.EngLastName,
                    Gender = adminData.Gender,
                    PasswordHash = PasswordServices.CreatePasswordHash(adminData.Password),
                    PersonRole = adminData.Role
                };

                _context.OhPeople.Add(newAdmin);
                _context.SaveChanges();

                return Ok(newAdmin);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error Registering Admin: {e.Message}");
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
        public IActionResult UpdateProfile(Guid id, [FromBody] UpdateProfileRequestDto dto)
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            Console.WriteLine("--- RECEIVED UpdateProfile DTO ---");
            Console.WriteLine(JsonSerializer.Serialize(dto, options));
            Console.WriteLine("----------------------------------");

            var person = _context.OhPeople.Find(id);
            if (person == null)
                return NotFound("Person not found.");

            var resident = _context.OhResidents
                             .Include(r => r.InterestNames)
                             .SingleOrDefault(r => r.ResidentId == id);
            if (resident == null)
                return NotFound("Resident not found.");

            if (id != dto.PersonId)
            {
                return BadRequest("Mismatched ID in URL and request body.");
            }

            person.PhoneNumber = dto.MobilePhone;
            person.Email = dto.Email;
            resident.HomePlace = dto.Origin;
            resident.Profession = dto.Profession;
            resident.ResidentDescription = dto.AboutMe;
            resident.ResidentApartmentNumber = dto.ResidentApartmentNumber;

            person.ProfilePicId = dto.ProfilePicture?.PicID;
            resident.AdditionalPic1Id = dto.AdditionalPicture1?.PicID;
            resident.AdditionalPic2Id = dto.AdditionalPicture2?.PicID;

            bool interestsWereEdited = (dto.InterestNames != null && dto.InterestNames.Any()) ||
                                       (dto.NewInterestNames != null && dto.NewInterestNames.Any());

            if (interestsWereEdited)
            {
                if (dto.NewInterestNames != null && dto.NewInterestNames.Any())
                {
                    foreach (var newName in dto.NewInterestNames)
                    {
                        if (!_context.OhInterests.Any(i => i.InterestName == newName))
                        {
                            _context.OhInterests.Add(new OhInterest { InterestName = newName });
                        }
                    }
                    _context.SaveChanges();
                }

                resident.InterestNames.Clear();

                var allSelectedNames = (dto.InterestNames ?? new List<string>())
                                        .Concat(dto.NewInterestNames ?? new List<string>())
                                        .Distinct()
                                        .ToList();

                if (allSelectedNames.Any())
                {
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

            _context.SaveChanges();
            return NoContent();
        }

        [HttpPost("reset-password/{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordDto dto)
        {
            if (id == Guid.Empty)
            {
                return BadRequest("A valid user ID must be provided.");
            }

            var person = await _context.OhPeople.FindAsync(id);
            if (person == null)
            {
                return NotFound("User not found.");
            }

            person.PasswordHash = PasswordServices.CreatePasswordHash(dto.NewPassword);

            _context.OhPeople.Update(person);
            await _context.SaveChangesAsync();

            return NoContent();
        }

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

            if (interestNames == null || !interestNames.Any())
            {
                var allDigests = await OhPerson.GetActiveResidentDigestsAsync(db);
                return Ok(allDigests);
            }

            var allResidentsWithInterests = db.OhResidents
                .Include(r => r.InterestNames)
                .ToList();

            var residentIds = allResidentsWithInterests
                .Where(resident => interestNames.All(requiredName =>
                    resident.InterestNames.Any(residentInterest => residentInterest.InterestName == requiredName)
                ))
                .Select(resident => resident.ResidentId)
                .ToList();

            if (!residentIds.Any())
            {
                return Ok(new List<ResidentDigest>());
            }

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
