using System;
using System.Collections.Generic;
using System.Linq;
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
            using var db = new MigdalorDBContext();
            var person = db.OhPeople.Find(id);
            if (person == null)
                return NotFound(); // Changed: NotFound()

            var resident = db.OhResidents.SingleOrDefault(r => r.ResidentId == id);
            if (resident == null)
                return NotFound(); // Changed: NotFound()

            // Update fields
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
