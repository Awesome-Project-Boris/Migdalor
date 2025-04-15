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
            // Minimal validation in controller
            // TODO: Security Check

            try
            {
                // Call the Static Method in the CORRECT Model class
                // *** Ensure OhListings (plural) is used here ***
                OhListing savedListing = await OhListing.CreateAndLinkPicturesAsync(
                    listingDto,
                    _context
                );

                // Return Success
                // *** Access ListingID from the correctly typed savedListing object ***
                return Ok(new { message = "Listing created successfully.", listingId = savedListing.ListingId });
            }
            catch (Exception ex) // Catch all exceptions
            {
                Console.WriteLine($"ERROR in CreateListing: {ex.Message} | Inner: {ex.InnerException?.Message}");
                // Return a generic 500 error
                return StatusCode(500, new
                {
                    message = "An error occurred while creating the listing.",
                    error = ex.Message
                });
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
