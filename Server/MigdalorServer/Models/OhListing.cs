using MigdalorServer.Database;
using MigdalorServer.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

            // --- Create Listing Entity ---
            var newListing = new OhListing // Use correct class name
            {
                ListingId = 0,
                Title = listingDto.Title,
                Description = listingDto.Description,
                SellerId = listingDto.SellerId,
                IsActive = true,
                Date = DateTime.UtcNow
            };

            dbContext.OhListings.Add(newListing); // Use correct DbSet property name

            // --- Step 1: Save Listing to get the ID ---
            await dbContext.SaveChangesAsync(); // Let exceptions propagate
            // *** newListing.ListingID is now populated by the database ***

            // --- Step 2: Link Pictures (Only if IDs were provided) ---
            var pictureIdsToLink = new List<int>();
            if (listingDto.MainPicId.HasValue) pictureIdsToLink.Add(listingDto.MainPicId.Value);
            if (listingDto.ExtraPicId.HasValue) pictureIdsToLink.Add(listingDto.ExtraPicId.Value);

            if (pictureIdsToLink.Any())
            {
                // Fetch pictures that were created earlier and are not yet linked
                var pictures = await dbContext.OhPictures
                                             .Where(p => pictureIdsToLink.Contains(p.PicId) && p.ListingId == null)
                                             .ToListAsync();

                if (pictures.Count != pictureIdsToLink.Count)
                {
                    // Log or handle the case where some provided IDs weren't found/linkable
                    Console.WriteLine($"WARNING: Could not find/link all provided picture IDs for Listing {newListing.ListingId}.");
                    // Optional: Check if MainPicId was provided but not found, throw if critical
                    if (listingDto.MainPicId.HasValue && !pictures.Any(p => p.PicId == listingDto.MainPicId.Value))
                    {
                        throw new InvalidOperationException($"Main picture (ID: {listingDto.MainPicId.Value}) required for linking was not found or already linked.");
                    }
                }

                // Link all pictures found
                foreach (var pic in pictures)
                {
                    // *** Use the ListingID obtained AFTER saving the listing ***
                    pic.ListingId = newListing.ListingId;
                }

                // Save the updates to the OhPicture records (only if any were found)
                if (pictures.Any())
                {
                    await dbContext.SaveChangesAsync(); // Let exceptions propagate
                }
            }

            return newListing; // Return the successfully created listing
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