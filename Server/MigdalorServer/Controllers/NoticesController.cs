using Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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
                return Ok(OhNotice.GetNotices());
            }
            catch (Exception e)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    e.InnerException?.Message ?? e.Message
                );
            }
        }

        private readonly MigdalorDBContext _context;
        private readonly ILogger<NoticesController> _logger;

        public NoticesController(MigdalorDBContext context, ILogger<NoticesController> logger)
        {
            _context = context;
            _logger = logger;
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

        [HttpGet("{id:int}")] // Route accepts an 'id' parameter
        public async Task<ActionResult<OhNotice>> GetNoticeById(int id) // id matches the route parameter
        {
            if (id <= 0) // Basic validation
            {
                return BadRequest("Invalid Notice ID provided.");
            }

            try
            {
                // Find the notice by its primary key (noticeID in the DB)
                // Ensure your NoticeModel has the correct primary key property mapped (e.g., NoticeId)
                var notice = await _context.OhNotices.FindAsync(id);

                if (notice == null)
                {
                    return NotFound($"Notice with ID {id} not found."); // Return 404 if not found
                }

                return Ok(notice); // Return 200 OK with the notice data
            }
            catch (Exception ex)
            {
                // Log the exception (replace Console.WriteLine with your actual logger)
                Console.WriteLine($"Error fetching notice with ID {id}: {ex.Message}");
                // Return a generic 500 error to the client
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        // POST api/<NoticeController>
        // In NoticesController.cs

        // In NoticesController.cs
        // Make sure to add these using statements at the top of your file:
        // using Microsoft.AspNetCore.Authorization;
        // using System.Security.Claims;

        [HttpPost]
        [Authorize(Roles = "admin")] // 1. Authorize attribute now checks for the lowercase "admin" role.
                                     // 2. This requires a valid JWT with the corresponding role claim.
        public IActionResult Post([FromBody] NewNotice notice)
        {
            // --- Model Validation (Best Practice) ---
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // --- Security Enhancement: Verify Sender ID from Token ---
            // Get the user's ID from the token's claims.
            var senderIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Check if the ID from the token matches the one in the request body.
            // This prevents an admin from creating a notice on behalf of someone else.
            if (string.IsNullOrEmpty(senderIdFromToken) || notice.SenderId.ToString() != senderIdFromToken)
            {
                _logger.LogWarning("Forbidden Action: User {TokenUserId} attempted to post a notice with a mismatched SenderId {BodySenderId}.", senderIdFromToken, notice.SenderId);
                return Forbid(); // Return 403 Forbidden
            }

            _logger.LogInformation("POST /api/Notices called by admin {AdminId} with title: {NoticeTitle}", senderIdFromToken, notice?.Title);

            try
            {
                var createdNotice = OhNotice.AddOhNotice(notice);

                _logger.LogInformation("Notice created successfully with ID: {NoticeId}", createdNotice.NoticeId);

                return Ok(createdNotice);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error occurred in POST /api/Notices. Message: {ErrorMessage}", e.Message);
                if (e.InnerException != null)
                {
                    _logger.LogError(e.InnerException, "Inner Exception details.");
                }

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    "An internal error occurred while creating the notice."
                );
            }
        }



        // PUT api/<NoticeController>/5
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public IActionResult Put(int id, [FromBody] NewNotice notice)
        {
            try
            {
                return Ok(OhNotice.UpdateNotice(id, notice));
            }
            catch (Exception e)
            {
                if (e.Message == "Notice not found")
                    return NotFound(e.Message);
                else
                    return StatusCode(
                        StatusCodes.Status500InternalServerError,
                        e.InnerException?.Message ?? e.Message
                    );
            }
        }


        // DELETE api/<NoticeController>/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public IActionResult Delete(int id)
        {
            try
            {
                OhNotice.DeleteNotice(id);
                return Ok();
            }
            catch (Exception e)
            {
                if (e.Message == "Notice not found")
                    return NotFound(e.Message);
                else
                    return StatusCode(
                        StatusCodes.Status500InternalServerError,
                        e.InnerException?.Message ?? e.Message
                    );
            }
        }
    }
}