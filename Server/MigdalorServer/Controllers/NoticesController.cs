using Microsoft.AspNetCore.Mvc;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NoticesController : ControllerBase
    {
        // GET: api/<NoticeController>
        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                return Ok(OhNotice.GetOhNotices());
            }
            catch (Exception e)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    e.InnerException?.Message ?? e.Message
                );
            }
        }

        // GET api/<NoticeController>/5
        [HttpGet("{category}")]
        public IActionResult Get(string category)
        {
            try
            {
                return Ok(OhNotice.GetOhNoticesByCategory(category));
            }
            catch (Exception e)
            {
                if (e.Message == "No notices found for this category")
                    return NotFound(e.Message);
                else
                    return StatusCode(
                        StatusCodes.Status500InternalServerError,
                        e.InnerException?.Message ?? e.Message
                    );
            }
        }

        // POST api/<NoticeController>
        [HttpPost]
        public IActionResult Post([FromBody] NewNotice notice)
        {
            try
            {
                return Ok(OhNotice.AddOhNotice(notice));
            }
            catch (Exception e)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    e.InnerException?.Message ?? e.Message
                );
            }
        }

        // PUT api/<NoticeController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value) { }

        // DELETE api/<NoticeController>/5
        [HttpDelete("{id}")]
        public void Delete(int id) { }
    }
}
