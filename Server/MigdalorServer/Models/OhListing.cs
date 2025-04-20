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

        public static async Task<OhListing> UpdateListingAsync(
            int listingId,
            ListingUpdateDto updateDto,
            MigdalorDBContext dbContext)
        {
            if (updateDto == null) throw new ArgumentNullException(nameof(updateDto));
            if (dbContext == null) throw new ArgumentNullException(nameof(dbContext));

            var existingListing = await dbContext.OhListings
                .FirstOrDefaultAsync(l => l.ListingId == listingId);

            if (existingListing == null)
            {
                throw new FileNotFoundException($"Listing with ID {listingId} not found.");
            }


            // --- Validation & Sanitization ---
            if (string.IsNullOrWhiteSpace(updateDto.Title)) { throw new ValidationException("Listing title cannot be empty."); }
            string sanitizedTitle = updateDto.Title.Trim();
            if (sanitizedTitle.Length > 100) { throw new ValidationException("Listing title cannot exceed 100 characters."); }

            string sanitizedDescription = updateDto.Description?.Trim();
            if (sanitizedDescription != null && sanitizedDescription.Length > 300) { throw new ValidationException("Listing description cannot exceed 300 characters."); }

            // --- Update Listing Entity Fields ---
            existingListing.Title = sanitizedTitle;
            existingListing.Description = sanitizedDescription;
            // Potentially update other direct listing fields like IsActive if included in DTO
            // if (updateDto.IsActive.HasValue) existingListing.IsActive = updateDto.IsActive.Value;

            // --- ** NEW: Link Newly Uploaded Pictures ** ---
            var newPictureIdsToLink = new List<int>();
            if (updateDto.MainPicId.HasValue) newPictureIdsToLink.Add(updateDto.MainPicId.Value);
            if (updateDto.ExtraPicId.HasValue) newPictureIdsToLink.Add(updateDto.ExtraPicId.Value);

            if (newPictureIdsToLink.Any())
            {
                // Find the corresponding picture records that were *just* uploaded
                // (They should exist and have ListingId = null)
                var picturesToLink = await dbContext.OhPictures
                     .Where(p => newPictureIdsToLink.Contains(p.PicId) && p.ListingId == null) // Ensure we only link unlinked pics
                     .ToListAsync();

                if (picturesToLink.Count != newPictureIdsToLink.Count)
                {
                    // This could happen if an invalid PicId was sent, or if a picture was somehow linked elsewhere already.
                    Console.WriteLine($"WARNING: Could not find all expected unlinked pictures to link for Listing {listingId}. Provided IDs: {string.Join(",", newPictureIdsToLink)}");
                    // Decide if this is a critical error or just a warning. We'll proceed for now.
                }

                foreach (var pic in picturesToLink)
                {
                    Console.WriteLine($"Linking Picture ID {pic.PicId} to Listing ID {listingId}");
                    pic.ListingId = listingId; // Set the foreign key
                                               // EF Core will track this change
                }
            }
            // --- ** End of Picture Linking Logic ** ---


            // --- Save Changes (Includes Listing updates AND Picture FK updates) ---
            try
            {
                await dbContext.SaveChangesAsync();
                Console.WriteLine($"Successfully updated Listing ID: {listingId} and linked pictures.");
                return existingListing;
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"ERROR saving updated listing (ID: {listingId}) or linking pictures: {ex.Message} | Inner: {ex.InnerException?.Message}");
                throw new InvalidOperationException("Failed to save listing updates to the database.", ex);
            }
        }


        // --- Updated: DeleteListingAsync (Simplified) ---
        public static async Task<bool> DeleteListingAsync(
            int listingId,
            MigdalorDBContext dbContext,
            string contentRootPath) // Use contentRootPath from IWebHostEnvironment
        {
            if (dbContext == null) throw new ArgumentNullException(nameof(dbContext));
            if (string.IsNullOrEmpty(contentRootPath)) throw new ArgumentNullException(nameof(contentRootPath), "Content root path must be provided for file deletion.");

            // Step 1: Fetch the listing itself (WITHOUT including pictures here)
            var listingToDelete = await dbContext.OhListings
                .FirstOrDefaultAsync(l => l.ListingId == listingId);

            if (listingToDelete == null)
            {
                Console.WriteLine($"Attempted to delete non-existent listing (ID: {listingId}).");
                return false; // Indicate not found
            }

            // --- Ownership Check REMOVED (Per user request - Add back if needed!) ---

            // Step 2: Fetch associated pictures separately using the ListingID
            var picturesToDelete = await dbContext.OhPictures
                .Where(p => p.ListingId == listingId)
                .ToListAsync();

            // Step 3: Delete Associated Picture Files & Records
            if (picturesToDelete.Any()) // Check if the list has items
            {
                Console.WriteLine($"Found {picturesToDelete.Count} pictures associated with listing {listingId} to delete.");
                foreach (var pic in picturesToDelete)
                {
                    bool picFileDeleted = await OhPicture.DeletePictureFileAsync(pic, contentRootPath);
                    if (!picFileDeleted)
                    {
                        Console.WriteLine($"Warning: Failed to delete picture FILE for ID {pic.PicId} associated with listing {listingId}. Continuing to remove DB record.");
                    }
                    // Remove the picture record from the context
                    dbContext.OhPictures.Remove(pic);
                }
            }

            // Step 4: Delete the Listing Record itself
            dbContext.OhListings.Remove(listingToDelete);

            // Step 5: Save all changes (listing deletion and picture deletions)
            try
            {
                await dbContext.SaveChangesAsync();
                Console.WriteLine($"Successfully deleted listing ID: {listingId} and associated picture records.");
                return true; // Indicate successful deletion
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"ERROR deleting listing (ID: {listingId}) during SaveChanges: {ex.Message} | Inner: {ex.InnerException?.Message}");
                // Consider specific error handling/logging
                throw new InvalidOperationException("Failed to save deletions to the database.", ex);
            }
        }
    }

}
