using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using System.ComponentModel.DataAnnotations;
using MigdalorServer.Models.DTOs;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MigdalorServer.Controllers
{

    

    [Route("api/[controller]")]
    [ApiController]
    public class ListingsController : ControllerBase
    {

        private readonly MigdalorDBContext _context;

        public ListingsController(MigdalorDBContext context)
        {
            _context = context;
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
        // [Authorize] // TODO: Add authorization
        public async Task<IActionResult> CreateListing([FromBody] ListingCreation listingDto)
        {

            try
            {
                OhListing savedListing = await OhListing.CreateAndLinkPicturesAsync(
                    listingDto,
                    _context
                );

                return Ok(new { message = "Listing created successfully.", listingId = savedListing.ListingId });
            }
            catch (Exception ex) // Catch all exceptions
            {
                Console.WriteLine($"ERROR in CreateListing: {ex.Message} | Inner: {ex.InnerException?.Message}");
                return StatusCode(500, new
                {
                    message = "An error occurred while creating the listing.",
                    error = ex.Message
                });
            }
        }

        [HttpGet("ActiveSummaries")]
        public async Task<ActionResult<IEnumerable<ListingSummary>>> GetActiveListingsSummary()
        {
            try
            {
                var listings = await _context.OhListings
                    .Where(l => l.IsActive) // Filter for active listings 
                    .Include(l => l.Seller) // Include Seller navigation property 
                    .Select(l => new
                    {
                        Listing = l,
                        SellerName = l.Seller.HebFirstName + " " + l.Seller.HebLastName, // Combine seller names 
                        // Get the main picture (role 'marketplace') or the first one if 'marketplace' role doesn't exist or fallback to null
                        MainPicture = _context.OhPictures
                                        .Where(p => p.ListingId == l.ListingId) // Filter pictures for this listing 
                                        .OrderBy(p => p.PicRole == "marketplace" ? 0 : 1) // Prioritize 'marketplace' role 
                                        .ThenBy(p => p.DateTime) // Then by date as a fallback ordering
                                        .FirstOrDefault() // Take the first one matching the criteria
                    })
                    .OrderByDescending(l => l.Listing.Date) // Order by listing date, newest first
                    .Select(l_info => new ListingSummary
                    {
                        ListingId = l_info.Listing.ListingId,
                        Title = l_info.Listing.Title,
                        Description = l_info.Listing.Description,
                        Date = l_info.Listing.Date,
                        SellerId = l_info.Listing.SellerId,
                        SellerName = l_info.SellerName,
                        MainImagePath = l_info.MainPicture != null ? l_info.MainPicture.PicPath : null // Select the path or null 
                    })
                    .ToListAsync(); // Execute the query

                return Ok(listings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in GetActiveListingsSummary: {ex.Message}");
                // Log the exception details (consider using a proper logging framework)
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
                Console.WriteLine($"ERROR in GetListingDetails Endpoint (ID: {id}): Null argument - {ex.Message}");
                return StatusCode(500, "An internal server error occurred (null argument).");
            }
            catch (Exception ex) // General catch
            {
                Console.WriteLine($"ERROR in GetListingDetails Endpoint (ID: {id}): {ex.Message}");
                return StatusCode(500, "An error occurred while fetching listing details.");
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
