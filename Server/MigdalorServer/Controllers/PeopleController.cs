using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
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
        // GET: api/<PeopleController>
        [HttpGet]
        public void GetAllPeople() { }

        // GET api/<PeopleController>/5
        [HttpGet("{id}")]
        public void GetPersonByID(Guid id) { }

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

        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value) { }

        // DELETE api/<PeopleController>/5
        [HttpDelete("{id}")]
        public void Delete(int id) { }
    }
}
