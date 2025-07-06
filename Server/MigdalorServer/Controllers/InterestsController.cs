using Microsoft.AspNetCore.Mvc;
using MigdalorServer.Database;
using MigdalorServer.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InterestsController : ControllerBase
    {

        private readonly MigdalorDBContext _context;

        // Inject the DbContext via the constructor
        public InterestsController(MigdalorDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<string>>> Get()
        {
            try
            {
                // The controller now calls the static method on the OhInterest class
                var interests = await OhInterests.GetAllInterestNamesAsync(_context);
                return Ok(interests);
            }
            catch
            {
                return StatusCode(500, "An error occurred while fetching interests.");
            }
        }

        //// GET: api/<InterestsController>
        //[HttpGet]
        //public IEnumerable<string> Get()
        //{
        //    return new string[] { "value1", "value2" };
        //}

        // GET api/<InterestsController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<InterestsController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<InterestsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<InterestsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
