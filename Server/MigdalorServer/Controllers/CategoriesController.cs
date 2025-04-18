using Microsoft.AspNetCore.Mvc;
using MigdalorServer.Database;
using MigdalorServer.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        // GET: api/<CategoriesController>
        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                return Ok(OhCategory.GetAllCategories());
            }
            catch
            {
                return StatusCode(500, "Error Getting Categories");
            }
        }

        // GET api/<CategoriesController>/5
        [HttpGet("{name}")]
        public OhCategory Get(string name)
        {
            return OhCategory.GetCategoryByName(name);
        }

        // POST api/<CategoriesController>
        [HttpPost]
        public void Post([FromBody] string value) { }

        // PUT api/<CategoriesController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value) { }

        // DELETE api/<CategoriesController>/5
        [HttpDelete("{id}")]
        public void Delete(int id) { }
    }
}
