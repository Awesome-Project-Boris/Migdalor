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

        public static async Task<bool> DeletePictureFileAsync(
            OhPicture pictureToDelete, // Pass the whole object to get PicPath
            string contentRootPath)    // Base path from controller
        {
            if (pictureToDelete == null || string.IsNullOrEmpty(pictureToDelete.PicPath))
            {
                Console.WriteLine($"Skipping file deletion for picture ID {pictureToDelete?.PicId}: No picture data or path.");
                return true; // Nothing to delete, consider it success
            }
            if (string.IsNullOrEmpty(contentRootPath))
            {
                Console.WriteLine($"ERROR deleting file for picture ID {pictureToDelete.PicId}: ContentRootPath is null or empty.");
                return false; // Cannot proceed without base path
            }

            string fullPath = ""; // Initialize
            try
            {
                // Construct path using ContentRootPath and the "uploadedFiles" folder
                // ** IMPORTANT: Adjust this logic based on how PicPath is actually stored! **
                string relativePath = pictureToDelete.PicPath.TrimStart('/', '\\');
                fullPath = Path.Combine(contentRootPath, "uploadedFiles", relativePath.Replace("Images/", "").Replace('/', Path.DirectorySeparatorChar));
                // If PicPath is just filename:
                // fullPath = Path.Combine(contentRootPath, "uploadedFiles", "Images", pictureToDelete.PicPath);

                Console.WriteLine($"Attempting to delete file at calculated path: {fullPath}");

                if (File.Exists(fullPath))
                {
                    await Task.Run(() => File.Delete(fullPath)); // Use Task.Run for IO
                    Console.WriteLine($"Deleted image file: {fullPath}");
                    return true; // File deleted successfully
                }
                else
                {
                    Console.WriteLine($"Warning: Image file not found for picture ID {pictureToDelete.PicId} at path: {fullPath}");
                    return true; // File didn't exist, consider deletion task done
                }
            }
            catch (ArgumentNullException anex)
            {
                Console.WriteLine($"ERROR deleting image file for picture ID {pictureToDelete.PicId}: Path construction failed (Argument Null). Path='{fullPath}'. Error: {anex.Message}");
                return false; // Indicate failure
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR deleting image file {fullPath} for picture ID {pictureToDelete.PicId}: {ex.Message}");
                return false; // Indicate failure
            }
        }

        // --- ADD THIS METHOD: Deletes file AND database record (for DELETE /api/Picture/{id}) ---
        public static async Task<bool> DeleteSinglePictureAndRecordAsync(
            int pictureId,
            MigdalorDBContext dbContext,
            string contentRootPath)
        {
            var pictureToDelete = await dbContext.OhPictures.FirstOrDefaultAsync(p => p.PicId == pictureId);
            if (pictureToDelete == null)
            {
                Console.WriteLine($"Picture ID {pictureId} not found for deletion.");
                return false; // Not found
            }

            // --- Ownership Check REMOVED (per user request) ---

            // Delete file first
            bool fileDeleted = await DeletePictureFileAsync(pictureToDelete, contentRootPath);
            if (!fileDeleted)
            {
                // Log warning, decide if you should proceed
                Console.WriteLine($"Proceeding to delete DB record for picture ID {pictureId} even though file deletion failed or file was not found.");
            }

            // Delete DB Record
            dbContext.OhPictures.Remove(pictureToDelete);
            try
            {
                await dbContext.SaveChangesAsync();
                Console.WriteLine($"Successfully deleted picture record ID: {pictureId}.");
                return true;
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"ERROR deleting picture record (ID: {pictureId}) during SaveChanges: {ex.Message} | Inner: {ex.InnerException?.Message}");
                throw new InvalidOperationException("Failed to delete picture record from the database.", ex);
            }
        }
    }
}
