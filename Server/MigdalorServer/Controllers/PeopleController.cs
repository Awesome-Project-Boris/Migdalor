using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
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

        // GET: api/People/details
        // This endpoint gets details for the currently logged-in user from their token.
        [HttpGet("details")]
        [Authorize]
        public IActionResult GetPersonDetailsForProfile()
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
                expires: DateTime.Now.AddHours(8), // Set token expiration
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
                var digests = await OhPerson.GetActiveResidentDigestsAsync(_context);
                return Ok(digests);
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
        public IActionResult UpdateProfile(Guid id, [FromBody] UpdateProfileDto dto)
        {
            using var db = new MigdalorDBContext();
            var person = db.OhPeople.Find(id);
            if (person == null)
                return NotFound();

            var resident = db.OhResidents.SingleOrDefault(r => r.ResidentId == id);
            if (resident == null)
                return NotFound();

            person.PhoneNumber = dto.MobilePhone;
            person.Email = dto.Email;
            resident.HomePlace = dto.Origin;
            resident.Profession = dto.Profession;
            resident.ResidentDescription = dto.AboutMe;
            resident.ResidentApartmentNumber = dto.ResidentApartmentNumber;
            person.ProfilePicId = dto.ProfilePicture?.PicId;
            resident.AdditionalPic1Id = dto.AdditionalPicture1?.PicId;
            resident.AdditionalPic2Id = dto.AdditionalPicture2?.PicId;

            db.SaveChanges();
            return NoContent();
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
