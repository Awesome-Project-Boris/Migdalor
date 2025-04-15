using MigdalorServer.Database;
using MigdalorServer.Models.DTOs; // Assuming DTO is here or accessible
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; // To pass logger
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MigdalorServer.Controllers;

namespace MigdalorServer.Models
{

    public partial class OhListing
    {
        
        public static async Task<OhListing> CreateAndLinkPicturesAsync(
            ListingsController.ListingCreationDto listingDto, // Use DTO defined in controller or move DTO
            MigdalorDBContext dbContext,
            ILogger logger)
        {
            // --- Validation (Basic - more can be added) ---
            if (listingDto == null) throw new ArgumentNullException(nameof(listingDto));
            // DTO validation attributes should be checked by the controller's ModelState

            // --- Create Listing Entity ---
            var newListing = new OhListing
            {
                Title = listingDto.Title,
                Description = listingDto.Description,
                SellerId = listingDto.SellerId,
                IsActive = true,
                Date = DateTime.UtcNow
            };

            dbContext.OhListings.Add(newListing);

            // --- Save Listing First ---
            try
            {
                await dbContext.SaveChangesAsync();
                logger.LogInformation("MODEL: Successfully created listing ID: {ListingId}", newListing.ListingID);
            }
            catch (DbUpdateException dbEx)
            {
                logger.LogError(dbEx, "MODEL: Database error saving new listing for Seller {SellerId}: {ErrorMessage}", listingDto.SellerId, dbEx.InnerException?.Message ?? dbEx.Message);
                throw; // Re-throw for controller to handle
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "MODEL: Unexpected error saving new listing for Seller {SellerId}", listingDto.SellerId);
                throw; // Re-throw
            }

            // --- Link Pictures ---
            var pictureIdsToLink = new List<int>();
            pictureIdsToLink.Add(listingDto.MainPicId);
            if (listingDto.ExtraPicId.HasValue)
            {
                pictureIdsToLink.Add(listingDto.ExtraPicId.Value);
            }

            if (pictureIdsToLink.Any())
            {
                try
                {
                    var pictures = await dbContext.OhPictures
                                                 .Where(p => pictureIdsToLink.Contains(p.PicId) && p.ListingId == null)
                                                 .ToListAsync();

                    var mainPic = pictures.FirstOrDefault(p => p.PicId == listingDto.MainPicId);
                    if (mainPic == null)
                    {
                        // This is critical - the main picture MUST exist and be unlinked
                        logger.LogError("MODEL: Main picture ID {MainPicId} not found or already linked for Listing {ListingId}.", listingDto.MainPicId, newListing.ListingID);
                        // Consider if you should delete the just-created listing here or let the controller decide based on the exception.
                        // For now, throwing an exception is cleaner.
                        throw new InvalidOperationException($"Main picture (ID: {listingDto.MainPicId}) not found or already linked.");
                    }

                    // Link all found pictures
                    foreach (var pic in pictures)
                    {
                        pic.ListingId = newListing.ListingID; // Set the FK
                        dbContext.Entry(pic).State = EntityState.Modified;
                        logger.LogInformation("MODEL: Linking PicId {PicId} to ListingId {ListingId}", pic.PicId, newListing.ListingID);
                    }

                    await dbContext.SaveChangesAsync(); // Save picture updates
                    logger.LogInformation("MODEL: Successfully linked {PictureCount} pictures to ListingId {ListingId}", pictures.Count, newListing.ListingID);

                }
                catch (DbUpdateException dbEx) // Catch errors during picture update
                {
                    logger.LogError(dbEx, "MODEL: DB Error linking pictures to ListingID {ListingId}: {ErrorMessage}", newListing.ListingID, dbEx.InnerException?.Message ?? dbEx.Message);
                    // Re-throw so controller knows linking failed AFTER listing was created
                    throw new Exception($"Listing created (ID: {newListing.ListingID}), but failed to link pictures.", dbEx);
                }
                catch (Exception ex) // Catch other errors during linking
                {
                    logger.LogError(ex, "MODEL: General Error linking pictures to ListingID {ListingId}", newListing.ListingID);
                    throw new Exception($"Listing created (ID: {newListing.ListingID}), but failed to link pictures.", ex);
                }
            }

            return newListing; // Return the created listing object
        }
    }
}

