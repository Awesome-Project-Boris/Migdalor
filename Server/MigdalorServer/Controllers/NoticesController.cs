using Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NoticesController : ControllerBase
    {
        private readonly MigdalorDBContext _context;
        private readonly ILogger<NoticesController> _logger;

        public NoticesController(MigdalorDBContext context, ILogger<NoticesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/<NoticesController>
        // This endpoint is now public, but will filter notices if a valid token is provided.
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var noticesQuery = from n in _context.OhNotices
                                   join s in _context.OhPeople on n.SenderId equals s.PersonId
                                   join cat in _context.OhCategories on n.NoticeCategory equals cat.CategoryHebName
                                   join pic in _context.OhPictures on n.PictureId equals pic.PicId into picGroup
                                   from pg in picGroup.DefaultIfEmpty()
                                   select new
                                   {
                                       Notice = n,
                                       Sender = s,
                                       Category = cat,
                                       Picture = pg
                                   };

                // Check if the user is authenticated. If so, apply role-based filtering.
                if (User.Identity.IsAuthenticated)
                {
                    var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
                    var isAdmin = userRoles.Contains("admin");

                    if (!isAdmin)
                    {
                        var allowedEngCategories = new HashSet<string>(userRoles);
                        noticesQuery = noticesQuery.Where(x => allowedEngCategories.Contains(x.Category.CategoryEngName));
                    }
                }

                var notices = await noticesQuery
                                     .OrderByDescending(x => x.Notice.CreationDate)
                                     .Select(x => new NoticeDto
                                     {
                                         NoticeId = x.Notice.NoticeId,
                                         SenderId = x.Notice.SenderId,
                                         EngSenderName = x.Sender.EngFirstName + " " + x.Sender.EngLastName,
                                         HebSenderName = x.Sender.HebFirstName + " " + x.Sender.HebLastName,
                                         CreationDate = x.Notice.CreationDate.HasValue ? DateTime.SpecifyKind(x.Notice.CreationDate.Value, DateTimeKind.Utc) : null,
                                         NoticeTitle = x.Notice.NoticeTitle,
                                         NoticeMessage = x.Notice.NoticeMessage,
                                         NoticeCategory = x.Notice.NoticeCategory,
                                         NoticeSubCategory = x.Notice.NoticeSubCategory,
                                         PictureId = x.Notice.PictureId,
                                         PicturePath = x.Picture.PicPath,
                                         CategoryColor = x.Category.CategoryColor
                                     }).ToListAsync();

                return Ok(notices);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Failed to retrieve notices.");
                return StatusCode(500, e.InnerException?.Message ?? e.Message);
            }
        }


        // This endpoint remains public as it was originally.
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

        // This endpoint remains public as it was originally.
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
                                        PicturePath = pg.PicPath,
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

        [HttpPost]
        [Authorize] // Authorization is required
        public async Task<IActionResult> Post([FromBody] NewNotice noticeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var senderIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isAdmin = userRoles.Contains("admin");

            if (string.IsNullOrEmpty(senderIdFromToken) || noticeDto.SenderId.ToString() != senderIdFromToken)
            {
                _logger.LogWarning("Forbidden Action: User {TokenUserId} attempted to post a notice with a mismatched SenderId {BodySenderId}.", senderIdFromToken, noticeDto.SenderId);
                return Forbid();
            }

            if (!isAdmin)
            {
                var category = await _context.OhCategories.FirstOrDefaultAsync(c => c.CategoryHebName == noticeDto.Category);
                if (category == null || !userRoles.Contains(category.CategoryEngName))
                {
                    _logger.LogWarning("Forbidden Action: User {TokenUserId} attempted to post a notice to an unauthorized category {CategoryName}.", senderIdFromToken, noticeDto.Category);
                    return Forbid();
                }
            }

            _logger.LogInformation("POST /api/Notices called by user {UserId} with title: {NoticeTitle}", senderIdFromToken, noticeDto?.Title);

            try
            {
                var newNotice = new OhNotice
                {
                    NoticeTitle = noticeDto.Title,
                    NoticeMessage = noticeDto.Content,
                    SenderId = noticeDto.SenderId,
                    NoticeCategory = noticeDto.Category,
                    NoticeSubCategory = noticeDto.SubCategory,
                    PictureId = noticeDto.PictureId,
                    CreationDate = DateTime.UtcNow
                };

                _context.OhNotices.Add(newNotice);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Notice created successfully with ID: {NoticeId}", newNotice.NoticeId);
                return CreatedAtAction(nameof(GetNoticeById), new { id = newNotice.NoticeId }, newNotice);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error occurred in POST /api/Notices. Message: {ErrorMessage}", e.Message);
                return StatusCode(500, "An internal error occurred while creating the notice.");
            }
        }

        [HttpPut("{id}")]
        [Authorize] // Authorization is required
        public async Task<IActionResult> Put(int id, [FromBody] NewNotice noticeDto)
        {
            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isAdmin = userRoles.Contains("admin");

            try
            {
                var noticeToUpdate = await _context.OhNotices.FindAsync(id);
                if (noticeToUpdate == null)
                {
                    return NotFound("Notice not found");
                }

                if (!isAdmin)
                {
                    var category = await _context.OhCategories.FirstOrDefaultAsync(c => c.CategoryHebName == noticeToUpdate.NoticeCategory);
                    if (category == null || !userRoles.Contains(category.CategoryEngName))
                    {
                        return Forbid();
                    }
                }

                noticeToUpdate.NoticeTitle = noticeDto.Title;
                noticeToUpdate.NoticeMessage = noticeDto.Content;
                noticeToUpdate.NoticeCategory = noticeDto.Category;
                noticeToUpdate.NoticeSubCategory = noticeDto.SubCategory;
                noticeToUpdate.PictureId = noticeDto.PictureId;

                await _context.SaveChangesAsync();
                return Ok(noticeToUpdate);
            }
            catch (Exception e)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    e.InnerException?.Message ?? e.Message
                );
            }
        }

        // This endpoint remains public as it was originally.
        [HttpGet("latest-timestamp")]
        public async Task<ActionResult<DateTime>> GetLatestNoticeTimestamp()
        {
            try
            {
                var latestNoticeDate = await _context.OhNotices
                    .Where(n => n.CreationDate.HasValue)
                    .OrderByDescending(n => n.CreationDate)
                    .Select(n => n.CreationDate.Value)
                    .FirstOrDefaultAsync();

                if (latestNoticeDate == default)
                {
                    return NotFound("No notices with a creation date found.");
                }

                var utcDate = DateTime.SpecifyKind(latestNoticeDate, DateTimeKind.Utc);
                return Ok(utcDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching latest notice timestamp.");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpDelete("{id}")]
        [Authorize] // Authorization is required
        public async Task<IActionResult> Delete(int id)
        {
            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isAdmin = userRoles.Contains("admin");
            try
            {
                var noticeToDelete = await _context.OhNotices.FindAsync(id);
                if (noticeToDelete == null)
                {
                    return NotFound("Notice not found");
                }
                if (!isAdmin)
                {
                    var category = await _context.OhCategories.FirstOrDefaultAsync(c => c.CategoryHebName == noticeToDelete.NoticeCategory);
                    if (category == null || !userRoles.Contains(category.CategoryEngName))
                    {
                        return Forbid();
                    }
                }
                _context.OhNotices.Remove(noticeToDelete);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    e.InnerException?.Message ?? e.Message
                );
            }
        }
    }
}