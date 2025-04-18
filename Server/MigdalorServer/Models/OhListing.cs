using MigdalorServer.Database;
using MigdalorServer.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models
{
    // *** Corrected class name to OhListings (plural) ***
    public partial class OhListing
    {

        public static async Task<OhListing> CreateAndLinkPicturesAsync(
    ListingCreation listingDto, // Uses DTO with optional Pic IDs
    MigdalorDBContext dbContext)
        {
            if (listingDto == null) throw new ArgumentNullException(nameof(listingDto));
            if (dbContext == null) throw new ArgumentNullException(nameof(dbContext));
            if (listingDto.SellerId == Guid.Empty) throw new ArgumentException("SellerId cannot be empty.", nameof(listingDto.SellerId));

            // --- 1. Validation & Basic Sanitization ---

            // Title Validation & Sanitization
            if (string.IsNullOrWhiteSpace(listingDto.Title))
            {
                throw new ValidationException("Listing title cannot be empty.");
            }
            string sanitizedTitle = listingDto.Title.Trim(); // Basic trim
            if (sanitizedTitle.Length > 100) // Check against DB limit [cite: 8]
            {
                throw new ValidationException("Listing title cannot exceed 100 characters.");
            }

            string sanitizedDescription = listingDto.Description?.Trim(); // Trim if not null
            if (sanitizedDescription != null && sanitizedDescription.Length > 300) // Check against DB limit [cite: 8]
            {
                throw new ValidationException("Listing description cannot exceed 300 characters.");
            }


            // --- 2. Create Listing Entity (using sanitized values) ---
            var newListing = new OhListing
            {
                ListingId = 0,
                Title = sanitizedTitle,           // Use sanitized value
                Description = sanitizedDescription, // Use sanitized value (could be null)
                SellerId = listingDto.SellerId,
                IsActive = true,
                Date = DateTime.UtcNow
            };

            dbContext.OhListings.Add(newListing);

            // --- 3. Save Listing to get the ID ---
            try
            {
                await dbContext.SaveChangesAsync(); // Let EF Core handle parameterization
            }
            catch (DbUpdateException ex)
            {
                // Handle potential database-level errors (e.g., unique constraints, FK violations)
                Console.WriteLine($"ERROR saving initial listing: {ex.Message} | Inner: {ex.InnerException?.Message}");
                // You might want to throw a more specific custom exception here
                throw new InvalidOperationException("Failed to save the new listing to the database.", ex);
            }
            // newListing.ListingId is now populated


            // --- 4. Link Pictures (logic remains the same) ---
            var pictureIdsToLink = new List<int>();
            if (listingDto.MainPicId.HasValue) pictureIdsToLink.Add(listingDto.MainPicId.Value);
            if (listingDto.ExtraPicId.HasValue) pictureIdsToLink.Add(listingDto.ExtraPicId.Value);

            if (pictureIdsToLink.Any())
            {
                var pictures = await dbContext.OhPictures
                                              .Where(p => pictureIdsToLink.Contains(p.PicId) && p.ListingId == null)
                                              .ToListAsync();

                if (pictures.Count != pictureIdsToLink.Count)
                {
                    Console.WriteLine($"WARNING: Could not find/link all provided picture IDs for Listing {newListing.ListingId}.");
                    if (listingDto.MainPicId.HasValue && !pictures.Any(p => p.PicId == listingDto.MainPicId.Value))
                    {
                        // Consider rolling back or throwing a more severe error if main pic link fails
                        throw new InvalidOperationException($"Main picture (ID: {listingDto.MainPicId.Value}) required for linking was not found or already linked.");
                    }
                }

                foreach (var pic in pictures)
                {
                    pic.ListingId = newListing.ListingId;
                }

                if (pictures.Any())
                {
                    try
                    {
                        await dbContext.SaveChangesAsync(); // Save picture FK updates
                    }
                    catch (DbUpdateException ex)
                    {
                        // Handle errors linking pictures
                        Console.WriteLine($"ERROR saving picture links for listing {newListing.ListingId}: {ex.Message} | Inner: {ex.InnerException?.Message}");
                        // Decide on error handling: maybe log and continue, or throw?
                        throw new InvalidOperationException("Failed to link pictures to the new listing.", ex);
                    }
                }
            }

            return newListing;
        }

        public async Task<List<ListingSummary>> GetActiveListingSummariesAsync(MigdalorDBContext _context)
        {
            // This is the same query logic moved from the controller
            var listings = await _context.OhListings
                .Where(l => l.IsActive)
                .Include(l => l.Seller)
                .Select(l => new
                {
                    Listing = l,
                    SellerName = l.Seller.HebFirstName + " " + l.Seller.HebLastName,
                    MainPicture = _context.OhPictures
                                    .Where(p => p.ListingId == l.ListingId)
                                    .OrderBy(p => p.PicRole == "marketplace" ? 0 : 1)
                                    .ThenBy(p => p.DateTime)
                                    .FirstOrDefault()
                })
                .OrderByDescending(l => l.Listing.Date)
                .Select(l_info => new ListingSummary
                {
                    ListingId = l_info.Listing.ListingId,
                    Title = l_info.Listing.Title,
                    Description = l_info.Listing.Description,
                    Date = l_info.Listing.Date,
                    SellerId = l_info.Listing.SellerId,
                    SellerName = l_info.SellerName,
                    MainImagePath = l_info.MainPicture != null ? l_info.MainPicture.PicPath : null
                })
                .ToListAsync();

            return listings;
        }


        public static async Task<ListingDetail?> GetListingDetailsByIdAsync(int listingId, MigdalorDBContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            // Step 1: Fetch the core listing details and include the Seller (OhPerson)
            var listing = await context.OhListings
                .Where(l => l.ListingId == listingId)
                .Include(l => l.Seller) // Include seller data (OhPerson) - This FK relationship is usually reliable
                .FirstOrDefaultAsync();

            if (listing == null)
            {
                return null; // Listing not found
            }

            // Step 2: Explicitly query for pictures related to this listing ID
            var pictures = await context.OhPictures
                .Where(p => p.ListingId == listingId) // Filter pictures by the ListingID foreign key
                .ToListAsync(); // Get all related pictures

            // Step 3: Find main and extra pictures from the retrieved list (LINQ to Objects)
            var mainPic = pictures
                .OrderBy(p => p.PicRole == "marketplace" ? 0 : 1) // Prioritize 'marketplace' role
                .ThenBy(p => p.DateTime) // Secondary sort by date
                .FirstOrDefault(); // Get the best match for main picture

            var extraPic = pictures
                .OrderBy(p => p.PicRole == "marketplace_extra" ? 0 : 1) // Prioritize 'marketplace_extra' role
                .ThenByDescending(p => p.DateTime) // Secondary sort
                .FirstOrDefault(p => p.PicId != mainPic?.PicId); // Ensure it's not the same as mainPic (if mainPic exists)

            // Step 4: Map entity data to DTO
            var dto = new ListingDetail
            {
                ListingId = listing.ListingId,
                Title = listing.Title,
                Description = listing.Description,
                Date = listing.Date,
                IsActive = listing.IsActive,

                // Seller info comes from the included Seller navigation property
                SellerId = listing.SellerId,
                SellerName = $"{listing.Seller.HebFirstName} {listing.Seller.HebLastName}",
                SellerEmail = listing.Seller.Email,
                SellerPhone = listing.Seller.PhoneNumber,

                // Map picture details from the separately queried pictures list
                MainPicture = mainPic == null ? null : new PictureDetail
                {
                    PicId = mainPic.PicId,
                    PicPath = mainPic.PicPath,
                    PicAlt = mainPic.PicAlt
                },
                ExtraPicture = extraPic == null ? null : new PictureDetail
                {
                    PicId = extraPic.PicId,
                    PicPath = extraPic.PicPath,
                    PicAlt = extraPic.PicAlt
                }
            };

            return dto;
        }

    }
}