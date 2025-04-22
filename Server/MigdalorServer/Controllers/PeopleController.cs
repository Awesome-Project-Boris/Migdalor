using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860


namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PeopleController : ControllerBase
    {


        private readonly MigdalorDBContext _context;

        // Inject DbContext and Configuration
        public PeopleController(MigdalorDBContext context)
        {
            _context = context;
        }

        // GET: api/<PeopleController>
        [HttpGet]
        public void GetAllPeople() { }

        // GET api/<PeopleController>/5
        [HttpGet("GetPersonByIDForProfile/{id}")]
        public IActionResult GetPersonByIDForProfile(Guid id) 
        {
            try
            {
                var data = OhPerson.GetPersonByIDForProfile(id);
                return Ok(data);
            }
            catch (Exception e)
            {
                switch (e.Message)
                {
                    case "User not found":
                        return StatusCode(StatusCodes.Status404NotFound, "User Not Found");
                    default:
                        return StatusCode(
                            StatusCodes.Status500InternalServerError,
                            $"Error getting user data: {e.InnerException?.Message ?? e.Message}"
                        );
                }
            }
        }

        // POST api/<PeopleController>
        [HttpPost("register")]
        public IActionResult Register([FromBody] UserRegister user)
        {
            try
            {
                return Ok(OhPerson.AddUser(user));
            }
            catch (Exception e)
            {
                return StatusCode(
                    500,
                    $"Error Registering User: {e.InnerException?.Message ?? e.Message}"
                );
            }
        }

        [HttpPost("login")]
        // public IActionResult Login([FromBody] UserLogin user)
        public IActionResult Login([FromBody] UserLogin userLogin)
        {
            try
            {
                OhPerson user = OhPerson.AuthenticateUser(userLogin);
                return Ok(new
                {
                    user.PersonId,
                    user.HebFirstName,
                    user.HebLastName,
                    user.EngFirstName,
                    user.EngLastName
                });
                
            }
            catch (Exception e)
            {
                switch (e.Message)
                {
                    case "User not found":
                        return StatusCode(StatusCodes.Status404NotFound, "User Not Found");
                    case "Wrong password":
                        return StatusCode(StatusCodes.Status401Unauthorized, "Wrong Password");
                    default:
                        return StatusCode(
                            StatusCodes.Status500InternalServerError,
                            $"Error Logging In: {e.InnerException?.Message ?? e.Message}"
                        );
                }
            }
        }

        [HttpGet("ActiveDigests")]
        public async Task<ActionResult<IEnumerable<ResidentDigest>>> GetActiveResidentDigests()
        {
            try
            {
                // Removed logic to get imageBaseUrl from configuration

                // Call the static query method (now without imageBaseUrl)
                // Make sure to call the method on the correct class (ResidentQueries, not OhPerson)
                var digests = await OhPerson.GetActiveResidentDigestsAsync(_context);

                return Ok(digests);
            }
            // Removed ArgumentException catch block as the specific check is gone
            catch (Exception ex) // General catch for other potential errors (e.g., database issues)
            {
                Console.WriteLine($"ERROR in GetActiveResidentDigests: {ex.Message}");
                // Log the exception
                return StatusCode(500, new { message = "An error occurred while fetching resident digests.", error = ex.Message });
            }
        }

        [HttpGet("isadmin")]
        public IActionResult IsAdmin(Guid userId)
        {
            try
            {
                return Ok(OhPerson.IsAdmin(userId));
            }
            catch (Exception e)
            {
                return StatusCode(
                    500,
                    $"Error Checking Admin Status: {e.InnerException?.Message ?? e.Message}"
                );
            }
        }

        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value) { }

        // DELETE api/<PeopleController>/5
        [HttpDelete("{id}")]
        public void Delete(int id) { }
    }
}
