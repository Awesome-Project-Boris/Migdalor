using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminListingsController : ControllerBase
    {
        private readonly MigdalorDBContext _context;

        public AdminListingsController(MigdalorDBContext context)
        {
            _context = context;
        }

        // GET: api/AdminListings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ListingForAdmin>>> GetListings()
        {
            return await _context
                .OhListings.Include(l => l.Seller)
                .Include(l => l.OhPictures) // Eager load pictures
                .Select(l => new ListingForAdmin
                {
                    ListingId = l.ListingId,
                    Title = l.Title,
                    Description = l.Description,
                    Date = l.Date,
                    IsActive = l.IsActive,
                    SellerName = l.Seller.HebFirstName + " " + l.Seller.HebLastName,
                    SellerEmail = l.Seller.Email,
                    // Find the path for the main and extra pictures
                    MainPicturePath = l
                        .OhPictures.FirstOrDefault(p => p.PicRole == "marketplace")
                        .PicPath,
                    ExtraPicturePath = l
                        .OhPictures.FirstOrDefault(p => p.PicRole == "marketplace_extra")
                        .PicPath,
                })
                .OrderByDescending(l => l.Date)
                .ToListAsync();
        }

        // POST: api/AdminListings
        [HttpPost]
        public async Task<ActionResult<OhListing>> PostListing(ListingCreation listingCreation)
        {
            var listing = new OhListing
            {
                Title = listingCreation.Title,
                Description = listingCreation.Description,
                SellerId = listingCreation.SellerId,
                Date = DateTime.UtcNow,
                IsActive = true,
            };

            _context.OhListings.Add(listing);
            await _context.SaveChangesAsync(); // Save to get the new ListingId

            // Now, associate the pictures
            await UpdateListingPictures(
                listing.ListingId,
                listingCreation.MainPicId,
                listingCreation.ExtraPicId
            );

            return CreatedAtAction(nameof(GetListings), new { id = listing.ListingId }, listing);
        }

        // PUT: api/AdminListings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutListing(int id, ListingUpdateDto listingUpdate)
        {
            var listing = await _context.OhListings.FindAsync(id);

            if (listing == null)
            {
                return NotFound();
            }

            listing.Title = listingUpdate.Title;
            listing.Description = listingUpdate.Description;
            _context.Entry(listing).State = EntityState.Modified;

            // Update pictures
            await UpdateListingPictures(id, listingUpdate.MainPicId, listingUpdate.ExtraPicId);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ListingExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/AdminListings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteListing(int id)
        {
            var listing = await _context
                .OhListings.Include(l => l.OhPictures)
                .FirstOrDefaultAsync(l => l.ListingId == id);
            if (listing == null)
            {
                return NotFound();
            }

            // Unlink pictures before deleting the listing
            foreach (var pic in listing.OhPictures)
            {
                pic.ListingId = null;
            }
            // Note: This does not delete the picture from the OH_Pictures table, only disassociates it.
            // You might want to delete them fully depending on your business logic.

            _context.OhListings.Remove(listing);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ListingExists(int id)
        {
            return _context.OhListings.Any(e => e.ListingId == id);
        }

        private async Task UpdateListingPictures(int listingId, int? mainPicId, int? extraPicId)
        {
            // Unlink all old pictures for this listing
            var oldPics = await _context
                .OhPictures.Where(p => p.ListingId == listingId)
                .ToListAsync();
            foreach (var oldPic in oldPics)
            {
                oldPic.ListingId = null;
                oldPic.PicRole = null;
            }

            // Link new main picture
            if (mainPicId.HasValue)
            {
                var mainPicture = await _context.OhPictures.FindAsync(mainPicId.Value);
                if (mainPicture != null)
                {
                    mainPicture.ListingId = listingId;
                    mainPicture.PicRole = "marketplace"; // As seen in your DB example
                }
            }

            // Link new extra picture
            if (extraPicId.HasValue)
            {
                var extraPicture = await _context.OhPictures.FindAsync(extraPicId.Value);
                if (extraPicture != null)
                {
                    extraPicture.ListingId = listingId;
                    extraPicture.PicRole = "marketplace";
                }
            }
            await _context.SaveChangesAsync();
        }
    }
}
