using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;
using System.Text.Json;

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


        [HttpPut("UpdateProfile/{id}")]
        public IActionResult UpdateProfile(Guid id, [FromBody] UpdateProfileDto dto)
        {
            using var db = new MigdalorDBContext();

            Console.WriteLine("printing dto:");
            Console.WriteLine("dto: " + JsonSerializer.Serialize(dto));
            Console.WriteLine("dto.ProfilePicture: " + JsonSerializer.Serialize(dto.ProfilePicture));
            Console.WriteLine("dto.ProfilePicture.PicId: " + dto.ProfilePicture?.PicId);

            var person = db.OhPeople.Find(id);

            var resident = db.OhResidents.SingleOrDefault(r => r.ResidentId == id);
                          //?? new OhResident { ResidentId = id, person.PersonId = id };

            // patch scalar fields...
            person.PhoneNumber = dto.MobilePhone;
            person.Email = dto.Email;
            resident.HomePlace = dto.Origin;
            resident.Profession = dto.Profession;
            resident.ResidentDescription = dto.AboutMe;
            resident.ResidentApartmentNumber = dto.ResidentApartmentNumber;


            //resident.SpouseId = dto.SpouseId;

            // patch pictures if provided
            if (dto.ProfilePicture != null)
                person.ProfilePicId = dto.ProfilePicture.PicId;
            if (dto.AdditionalPicture1 != null)
                resident.AdditionalPic1Id = dto.AdditionalPicture1.PicId;
            if (dto.AdditionalPicture2 != null)
                resident.AdditionalPic2Id = dto.AdditionalPicture2.PicId;

            //if (resident.Id == 0)
            //    db.OhResidents.Add(resident);

            db.SaveChanges();
            return NoContent();
        }

        // DELETE api/<PeopleController>/5
        [HttpDelete("{id}")]
        public void Delete(int id) { }
    }
}
