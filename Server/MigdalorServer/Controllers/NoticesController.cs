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
        // In NoticesController.cs

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var notices = await (from n in _context.OhNotices
                                     join s in _context.OhPeople on n.SenderId equals s.PersonId
                                     join cat in _context.OhCategories on n.NoticeCategory equals cat.CategoryHebName
                                     join pic in _context.OhPictures on n.PictureId equals pic.PicId into picGroup
                                     from pg in picGroup.DefaultIfEmpty()
                                     orderby n.CreationDate descending
                                     select new NoticeDto
                                     {
                                         NoticeId = n.NoticeId,
                                         SenderId = n.SenderId,
                                         EngSenderName = s.EngFirstName + " " + s.EngLastName,
                                         HebSenderName = s.HebFirstName + " " + s.HebLastName,
                                         CreationDate = n.CreationDate.HasValue ? DateTime.SpecifyKind(n.CreationDate.Value, DateTimeKind.Utc) : null,
                                         NoticeTitle = n.NoticeTitle,
                                         NoticeMessage = n.NoticeMessage,
                                         NoticeCategory = n.NoticeCategory,
                                         NoticeSubCategory = n.NoticeSubCategory,
                                         PictureId = n.PictureId,
                                         PicturePath = pg.PicPath,
                                         CategoryColor = cat.CategoryColor
                                     }).ToListAsync();

                return Ok(notices);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Failed to retrieve notices.");
                return StatusCode(500, e.InnerException?.Message ?? e.Message);
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
            // This method uses a static call. If you need the timezone fix here as well,
            // it would need to be rewritten similar to the main Get() method above.
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

        [HttpGet("{id:int}")]
        public async Task<ActionResult<NoticeDto>> GetNoticeById(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid Notice ID provided.");
            }

            try
            {
                var notice = await (from n in _context.OhNotices
                                    where n.NoticeId == id
                                    join s in _context.OhPeople on n.SenderId equals s.PersonId
                                    join cat in _context.OhCategories on n.NoticeCategory equals cat.CategoryHebName
                                    join pic in _context.OhPictures on n.PictureId equals pic.PicId into picGroup
                                    from pg in picGroup.DefaultIfEmpty()
                                    select new NoticeDto
                                    {
                                        NoticeId = n.NoticeId,
                                        SenderId = n.SenderId,
                                        EngSenderName = s.EngFirstName + " " + s.EngLastName,
                                        HebSenderName = s.HebFirstName + " " + s.HebLastName,
                                        CreationDate = n.CreationDate.HasValue ? DateTime.SpecifyKind(n.CreationDate.Value, DateTimeKind.Utc) : null,
                                        NoticeTitle = n.NoticeTitle,
                                        NoticeMessage = n.NoticeMessage,
                                        NoticeCategory = n.NoticeCategory,
                                        NoticeSubCategory = n.NoticeSubCategory,
                                        PictureId = n.PictureId,
                                        PicturePath = pg.PicPath, // Include the picture path
                                        CategoryColor = cat.CategoryColor
                                    }).FirstOrDefaultAsync();

                if (notice == null)
                {
                    return NotFound($"Notice with ID {id} not found.");
                }
                return Ok(notice);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching notice with ID {id}");
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
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Post([FromBody] NewNotice noticeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var senderIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(senderIdFromToken) || noticeDto.SenderId.ToString() != senderIdFromToken)
            {
                _logger.LogWarning("Forbidden Action: User {TokenUserId} attempted to post a notice with a mismatched SenderId {BodySenderId}.", senderIdFromToken, noticeDto.SenderId);
                return Forbid();
            }

            _logger.LogInformation("POST /api/Notices called by admin {AdminId} with title: {NoticeTitle}", senderIdFromToken, noticeDto?.Title);

            try
            {
                var newNotice = new OhNotice
                {
                    NoticeTitle = noticeDto.Title,
                    NoticeMessage = noticeDto.Content,
                    SenderId = noticeDto.SenderId,
                    NoticeCategory = noticeDto.Category,
                    NoticeSubCategory = noticeDto.SubCategory,
                    PictureId = noticeDto.PictureId, // Map the new field
                    CreationDate = DateTime.UtcNow // Set creation date
                };

                _context.OhNotices.Add(newNotice);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Notice created successfully with ID: {NoticeId}", newNotice.NoticeId);

                // Return the created object
                return CreatedAtAction(nameof(GetNoticeById), new { id = newNotice.NoticeId }, newNotice);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error occurred in POST /api/Notices. Message: {ErrorMessage}", e.Message);
                return StatusCode(500, "An internal error occurred while creating the notice.");
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

        [HttpGet("latest-timestamp")]
        public async Task<ActionResult<DateTime>> GetLatestNoticeTimestamp()
        {
            try
            {
                var latestNoticeDate = await _context.OhNotices
                    .Where(n => n.CreationDate.HasValue)
                    .OrderByDescending(n => n.CreationDate)
                    .Select(n => n.CreationDate.Value) // Use .Value since we filtered for non-null
                    .FirstOrDefaultAsync();

                if (latestNoticeDate == default)
                {
                    return NotFound("No notices with a creation date found.");
                }

                // --- FIX: Specify that the DateTime from the DB should be treated as UTC ---
                var utcDate = DateTime.SpecifyKind(latestNoticeDate, DateTimeKind.Utc);

                return Ok(utcDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching latest notice timestamp.");
                return StatusCode(500, "An internal server error occurred.");
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