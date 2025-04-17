using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;

namespace MigdalorServer.Models
{
    public partial class OhPicture // Assuming this is in Models/OhPicture.cs
    {
        
        public static async Task<OhPicture?> CreatePictureRecordAsync(
            MigdalorDBContext dbContext,
            string uniqueFileName,
            string relativeWebPath,
            string picRole,
            string picAlt,
            Guid uploaderId)
        {
            // --- Input Validation ---
            if (dbContext == null) throw new ArgumentNullException(nameof(dbContext));
            if (string.IsNullOrWhiteSpace(uniqueFileName)) throw new ArgumentNullException(nameof(uniqueFileName));
            if (string.IsNullOrWhiteSpace(relativeWebPath)) throw new ArgumentNullException(nameof(relativeWebPath));
            if (string.IsNullOrWhiteSpace(picRole)) throw new ArgumentNullException(nameof(picRole));
            if (string.IsNullOrWhiteSpace(picAlt)) throw new ArgumentNullException(nameof(picAlt));


            var newPicture = new OhPicture
            {
                PicName = uniqueFileName, 
                PicPath = relativeWebPath,
                PicAlt = picAlt,
                PicRole = picRole,
                UploaderId = uploaderId,
                DateTime = DateTime.UtcNow, 
                ListingId = null 
            };

            try
            {
                dbContext.OhPictures.Add(newPicture);
                await dbContext.SaveChangesAsync();
                Console.WriteLine($"Successfully created OhPicture record with ID: {newPicture.PicId} for path: {relativeWebPath}");
                return newPicture; // Return the saved entity (includes PicId)
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"Database Error creating OhPicture record for {relativeWebPath}: {dbEx.InnerException?.Message ?? dbEx.Message}");
                // Re-throw to allow the controller to handle cleanup and response
                throw;
            }
            catch (Exception ex) 
            {
                Console.WriteLine($"General Error creating OhPicture record for {relativeWebPath}: {ex.Message}");
                throw; 
            }
        }
    }
}
