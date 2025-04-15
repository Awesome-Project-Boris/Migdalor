using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using System.ComponentModel.DataAnnotations;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MigdalorServer.Controllers
{

    public class ListingCreationDto
    {
        [Required(ErrorMessage = "Listing title is required.")]
        [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters.")]
        public string Title { get; set; } = null!;

        [StringLength(300, ErrorMessage = "Description cannot exceed 300 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Seller ID is required.")]
        public Guid SellerId { get; set; } // Should match authenticated user

        [Required(ErrorMessage = "Main picture ID is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Invalid Main Picture ID.")]
        public int MainPicId { get; set; } // ID returned from PictureController

        [Range(1, int.MaxValue, ErrorMessage = "Invalid Extra Picture ID.")]
        public int? ExtraPicId { get; set; } // Optional ID from PictureController
    }

    [Route("api/[controller]")]
    [ApiController]
    public class ListingsController : ControllerBase
    {

        private readonly MigdalorDBContext _context;
        private readonly ILogger<ListingsController> _logger;

        // Inject DbContext and Logger via constructor
        public ListingsController(MigdalorDBContext context, ILogger<ListingsController> logger)
        {
            _context = context;
            _logger = logger;
        }


        // GET: api/<ListingsController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<ListingsController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<ListingsController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }


        [HttpPost("Create")]
        // [Authorize] // TODO: Add authorization - IMPORTANT!
        public async Task<IActionResult> CreateListing([FromBody] ListingCreationDto listingDto)
        {
            // --- Step 1: Controller-level Validation ---
            if (!ModelState.IsValid)
            {
                // Return validation errors if DTO annotations fail
                return BadRequest(ModelState);
            }

            // --- Step 2: Security Check (Placeholder) ---
            // Guid authenticatedUserId = GetUserIdFromClaims(); // Implement function to get ID from HttpContext.User
            // if (listingDto.SellerId != authenticatedUserId)
            // {
            //     _logger.LogWarning("Attempt to create listing for another user. Requester: {AuthenticatedUserId}, DTO SellerId: {DtoSellerId}", authenticatedUserId, listingDto.SellerId);
            //     return Forbid(); // Or Unauthorized()
            // }

            // --- Step 3: Call the Static Method in the Model ---
            try
            {
                // Delegate the core logic (DB interactions) to the static method
                OhListing savedListing = await OhListing.CreateAndLinkPicturesAsync(
                    listingDto,
                    _context, // Pass the DbContext
                    _logger   // Pass the Logger
                );

                // --- Step 4: Handle Success ---
                _logger.LogInformation("CONTROLLER: Listing {ListingId} created and pictures linked successfully via model method.", savedListing.ListingID);
                // Return 200 OK with the ID of the newly created listing
                return Ok(new { message = "Listing created successfully.", listingId = savedListing.ListingID });
            }
            // --- Step 5: Handle Exceptions Thrown by the Static Method ---
            catch (InvalidOperationException invOpEx) // E.g., Main picture not found or already linked
            {
                _logger.LogError(invOpEx, "CONTROLLER: Invalid operation reported by model during listing creation for Seller {SellerId}.", listingDto.SellerId);
                // Return 400 Bad Request because the input data (PicId) was likely invalid
                return BadRequest(new { message = "Failed to create listing: " + invOpEx.Message });
            }
            catch (DbUpdateException dbEx) // Catch specific DB errors
            {
                _logger.LogError(dbEx, "CONTROLLER: Database error reported by model during listing creation/linking for Seller {SellerId}.", listingDto.SellerId);
                // Return 500 Internal Server Error for database issues
                return StatusCode(500, new { message = "Failed due to database error.", error = dbEx.InnerException?.Message ?? dbEx.Message });
            }
            catch (Exception ex) // Catch any other unexpected errors
            {
                _logger.LogError(ex, "CONTROLLER: Unexpected error reported by model during listing creation for Seller {SellerId}.", listingDto.SellerId);
                // Check if the inner exception indicates linking failed after creation (as thrown by the static method)
                if (ex.InnerException is DbUpdateException || ex.Message.Contains("failed to link pictures"))
                {
                    // Return 207 Multi-Status to indicate partial success (listing created, linking failed)
                    return StatusCode(207, new { message = ex.Message });
                }
                // Return 500 for other general errors
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        // PUT api/<ListingsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<ListingsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
