using Microsoft.AspNetCore.Mvc;
using MigdalorServer.Database;
using MigdalorServer.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserSettingsController : ControllerBase
    {
        // GET: api/<UserSettingsController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<UserSettingsController>/5
        [HttpGet("{id}")]
        public IActionResult Get(Guid id)
        {
            try
            {
                using MigdalorDBContext db = new MigdalorDBContext();
                OhUserSetting? data = db.OhUserSettings.FirstOrDefault(x => x.UserId == id);
                if (data == null)
                {
                    return NotFound("User Not Found");
                }
                return Ok(data);
            }
            catch (Exception e)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    $"Error getting user data: {e.InnerException?.Message ?? e.Message}"
                );
            }
        }

        // POST api/<UserSettingsController>
        [HttpPost]
        public IActionResult Post([FromBody] OhUserSetting settings)
        {
            try
            {
                using MigdalorDBContext db = new MigdalorDBContext();
                var existingSetting = db.OhUserSettings.FirstOrDefault(x => x.UserId == settings.UserId);
                if (existingSetting != null) {
                    existingSetting.UserSelectedDirection = settings.UserSelectedDirection;
                    existingSetting.UserSelectedFontSize = settings.UserSelectedFontSize;
                    existingSetting.UserSelectedLanguage = settings.UserSelectedLanguage;
                }
                else
                {
                    try
                    {
                    db.OhUserSettings.Add(settings);

                    }
                    catch (Exception e)
                    {
                        throw new Exception($"User Not Found");
                    }
                }
                db.SaveChanges();
                return Ok(settings);
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

        // PUT api/<UserSettingsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<UserSettingsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
