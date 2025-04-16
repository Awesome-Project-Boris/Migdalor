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
        /// <summary>
        /// Creates OhListings record & links optional OhPicture records.
        /// Lean version: Saves listing, then links pictures. Throws exceptions on failure.
        /// </summary>
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
    }
}