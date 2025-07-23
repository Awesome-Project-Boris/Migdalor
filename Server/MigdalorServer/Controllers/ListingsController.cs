using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ListingsController : ControllerBase
    {
        private readonly MigdalorDBContext _context;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public ListingsController(MigdalorDBContext context, IWebHostEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
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
        public void Post([FromBody] string value) { }

        [HttpPost("Create")]
        // [Authorize] // TODO: Add authorization
        public async Task<IActionResult> CreateListing([FromBody] ListingCreation listingDto)
        {
            try
            {
                OhListing savedListing = await OhListing.CreateAndLinkPicturesAsync(
                    listingDto,
                    _context
                );

                return Ok(
                    new
                    {
                        message = "Listing created successfully.",
                        listingId = savedListing.ListingId,
                    }
                );
            }
            catch (Exception ex) // Catch all exceptions
            {
                Console.WriteLine(
                    $"ERROR in CreateListing: {ex.Message} | Inner: {ex.InnerException?.Message}"
                );
                return StatusCode(
                    500,
                    new
                    {
                        message = "An error occurred while creating the listing.",
                        error = ex.Message,
                    }
                );
            }
        }

        [HttpGet("ActiveSummaries")]
        public async Task<ActionResult<IEnumerable<ListingSummary>>> GetActiveListingsSummary()
        {
            try
            {
                // Step 1: Fetch the raw data and bring it into memory with ToListAsync()
                var intermediateData = await _context
                    .OhListings.Where(l => l.IsActive!.Value)
                    .Include(l => l.Seller)
                    .Select(l => new
                    {
                        Listing = l,
                        SellerName = l.Seller.HebFirstName + " " + l.Seller.HebLastName,
                        MainPicture = _context
                            .OhPictures.Where(p => p.ListingId == l.ListingId)
                            .OrderBy(p => p.PicRole == "marketplace" ? 0 : 1)
                            .ThenBy(p => p.DateTime)
                            .FirstOrDefault(),
                    })
                    .OrderByDescending(l => l.Listing.Date)
                    .ToListAsync();

                // Step 2: Now that the data is in memory, create the final DTOs with the corrected date
                var finalResult = intermediateData.Select(l_info => new ListingSummary
                {
                    ListingId = l_info.Listing.ListingId,
                    Title = l_info.Listing.Title,
                    Description = l_info.Listing.Description,
                    // --- APPLY THE FIX HERE ---
                    Date = DateTime.SpecifyKind(l_info.Listing.Date, DateTimeKind.Utc),
                    SellerId = l_info.Listing.SellerId,
                    SellerName = l_info.SellerName,
                    MainImagePath = l_info.MainPicture != null ? l_info.MainPicture.PicPath : null,
                }).ToList();

                return Ok(finalResult);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in GetActiveListingsSummary: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching listings.");
            }
        }

        [HttpGet("Details/{id}")]
        // Use the correct DTO name here
        public async Task<ActionResult<ListingDetail>> GetListingDetails(int id)
        {
            try
            {
                // Call the static method on OhListing, passing the context
                var listingDetails = await OhListing.GetListingDetailsByIdAsync(id, _context);

                if (listingDetails == null)
                {
                    return NotFound($"Listing with ID {id} not found.");
                }

                return Ok(listingDetails);
            }
            catch (ArgumentNullException ex) // Catch specific exceptions if needed
            {
                Console.WriteLine(
                    $"ERROR in GetListingDetails Endpoint (ID: {id}): Null argument - {ex.Message}"
                );
                return StatusCode(500, "An internal server error occurred (null argument).");
            }
            catch (Exception ex) // General catch
            {
                Console.WriteLine($"ERROR in GetListingDetails Endpoint (ID: {id}): {ex.Message}");
                return StatusCode(500, "An error occurred while fetching listing details.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateListing(
            [FromRoute] int id,
            [FromBody] ListingUpdateDto updateDto
        )
        {
            // WARNING: Ownership check is assumed to happen *before* this action is called.
            try
            {
                // Call BL method without currentUserId
                var updatedListing = await OhListing.UpdateListingAsync(id, updateDto, _context);

                // Note: The BL method now throws FileNotFoundException if not found
                // if (updatedListing == null) return NotFound(...); // This check is now redundant if BL throws

                return Ok(
                    new
                    {
                        message = "Listing updated successfully.",
                        listingId = updatedListing.ListingId,
                    }
                ); // Or return NoContent()
            }
            catch (ValidationException vex)
            {
                return BadRequest(new { message = "Validation failed.", error = vex.Message });
            }
            catch (FileNotFoundException fnfex) // Catch specific exception from BL
            {
                return NotFound(fnfex.Message);
            }
            // Removed UnauthorizedAccessException catch block
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"ERROR in UpdateListing (ID: {id}): {ex.Message} | Inner: {ex.InnerException?.Message}"
                );
                return StatusCode(
                    500,
                    new
                    {
                        message = "An error occurred while updating the listing.",
                        error = ex.Message,
                    }
                );
            }
        }

        [HttpGet("latest-timestamp")]
        public async Task<ActionResult<DateTime>> GetLatestListingTimestamp()
        {
            try
            {
                var latestListingDate = await _context.OhListings
                    .OrderByDescending(l => l.Date)
                    .Select(l => l.Date)
                    .FirstOrDefaultAsync();

                if (latestListingDate == default)
                {
                    return NotFound("No listings found.");
                }

                // --- FIX: Specify that the DateTime from the DB should be treated as UTC ---
                var utcDate = DateTime.SpecifyKind(latestListingDate, DateTimeKind.Utc);

                return Ok(utcDate);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching latest listing timestamp: {ex.Message}");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpDelete("{id}")]
        // [Authorize] // Removed
        public async Task<IActionResult> DeleteListing([FromRoute] int id)
        {
            // WARNING: Ownership check is assumed to happen *before* this action is called.
            try
            {
                // Call BL method without currentUserId
                bool deleted = await OhListing.DeleteListingAsync(
                    id,
                    _context,
                    _hostingEnvironment.ContentRootPath
                );

                if (!deleted)
                {
                    // If BL returns false instead of throwing FileNotFoundException
                    return NotFound($"Listing with ID {id} not found.");
                }
                return Ok(new { message = "Listing deleted successfully." }); // Or return NoContent()
            }
            catch (FileNotFoundException fnfex) // Catch specific exception from BL if it throws
            {
                return NotFound(fnfex.Message);
            }
            // Removed UnauthorizedAccessException catch block
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"ERROR in DeleteListing (ID: {id}): {ex.Message} | Inner: {ex.InnerException?.Message}"
                );
                return StatusCode(
                    500,
                    new
                    {
                        message = "An error occurred while deleting the listing.",
                        error = ex.Message,
                    }
                );
            }
        }
    }
}
