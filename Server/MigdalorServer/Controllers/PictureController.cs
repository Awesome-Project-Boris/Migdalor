using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using MigdalorServer.Database;
using MigdalorServer.Models; 
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; 

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PictureController : ControllerBase
    {
        private readonly MigdalorDBContext _context;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public PictureController(MigdalorDBContext context, IWebHostEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        // Response structure for the client
        public class FileUploadResult
        {
            public bool Success { get; set; }
            public string? OriginalFileName { get; set; }
            public string? ServerPath { get; set; }
            public int? PicId { get; set; }
            public string? ErrorMessage { get; set; }
        }

        // POST api/Picture
        [HttpPost]
        public async Task<IActionResult> Post(
            [FromForm] List<IFormFile> files,
            [FromForm] List<string> picRoles,
            [FromForm] List<string> picAlts,
            [FromForm] Guid uploaderId) // TODO: Get from HttpContext.User
        {

            //Console.WriteLine($"FILES COUNT: {files?.Count}");
            //Console.WriteLine($"ROLES COUNT: {picRoles?.Count}");
            //Console.WriteLine($"ALTS COUNT: {picAlts?.Count}");
            //Console.WriteLine($"UPLOADER ID: {uploaderId}");



            //Console.WriteLine($"--- PictureController POST action HIT at {DateTime.UtcNow} ---");

            // --- Validation ---
            if (files == null || !files.Any()) return BadRequest(new { message = "No files provided." });
            if (picRoles == null || picAlts == null || files.Count != picRoles.Count || files.Count != picAlts.Count)
                return BadRequest(new { message = "Mismatch between number of files, roles, and alt texts." });
            // TODO: Validate uploaderId

            var results = new List<FileUploadResult>();
            string uploadsFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles");
            if (!Directory.Exists(uploadsFolderPath))
            { /* ... create directory ... */
                try { Directory.CreateDirectory(uploadsFolderPath); }
                catch (Exception ex) { return StatusCode(500, new { message = "Cannot create upload directory.", error = ex.Message }); }
            }

            for (int i = 0; i < files.Count; i++)
            {
                var formFile = files[i];
                var picRole = picRoles[i];
                var picAlt = picAlts[i];
                var result = new FileUploadResult { OriginalFileName = formFile.FileName };

                // --- Input Validation per file ---
                if (string.IsNullOrWhiteSpace(picRole))
                { /* ... handle missing role ... */
                    result.Success = false; result.ErrorMessage = $"Role is missing for file {formFile.FileName ?? $"#{i + 1}"}."; results.Add(result); continue;
                }
                if (string.IsNullOrWhiteSpace(picAlt))
                { /* ... handle missing alt ... */
                    result.Success = false; result.ErrorMessage = $"Alt text is missing for file {formFile.FileName ?? $"#{i + 1}"}."; results.Add(result); continue;
                }

                if (formFile.Length > 0)
                {
                    string uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(formFile.FileName)}";
                    string filePath = Path.Combine(uploadsFolderPath, uniqueFileName);
                    string relativeWebPath = $"/Images/{uniqueFileName}";
                    bool fileSavedSuccessfully = false;

                    try
                    {
                        // 1. Save File to Filesystem
                        using (var stream = System.IO.File.Create(filePath))
                        {
                            await formFile.CopyToAsync(stream);
                        }
                        fileSavedSuccessfully = true; // Mark as saved
                        Console.WriteLine($"CONTROLLER: Saved file {uniqueFileName}");

                        // 2. Call Static Method in OhPicture to Create DB Record
                        // Pass the DbContext instance (_context)
                        OhPicture savedPicture = await OhPicture.CreatePictureRecordAsync(
                            _context, uniqueFileName, relativeWebPath, picRole, picAlt, uploaderId
                        );

                        // If CreatePictureRecordAsync succeeds, it returns the saved picture
                        result.Success = true;
                        result.ServerPath = relativeWebPath;
                        result.PicId = savedPicture.PicId; // Get ID from the result
                        Console.WriteLine($"CONTROLLER: DB record created for {uniqueFileName}, ID: {savedPicture.PicId}");

                    }
                    catch (DbUpdateException dbEx) // Catch specific DB errors from the static method
                    {
                        Console.WriteLine($"CONTROLLER: DB Error for {formFile.FileName}. {dbEx.InnerException?.Message ?? dbEx.Message}");
                        result.Success = false;
                        result.ErrorMessage = $"Database error saving metadata: {dbEx.InnerException?.Message ?? dbEx.Message}";
                        // Attempt cleanup because DB failed AFTER file was potentially saved
                        if (fileSavedSuccessfully) await TryDeletePhysicalFile(filePath, formFile.FileName);
                    }
                    catch (ArgumentNullException argEx) // Catch validation errors from the static method
                    {
                        Console.WriteLine($"CONTROLLER: Invalid arguments for {formFile.FileName}. {argEx.Message}");
                        result.Success = false;
                        result.ErrorMessage = $"Invalid data provided: {argEx.ParamName}";
                        // No file cleanup needed if validation failed before saving
                    }
                    catch (IOException ioEx) // Catch file saving errors specifically
                    {
                        Console.WriteLine($"CONTROLLER: IO Error saving {formFile.FileName}. {ioEx.Message}");
                        result.Success = false;
                        result.ErrorMessage = $"Failed to save file: {ioEx.Message}";
                        // No DB cleanup needed, file wasn't saved
                    }
                    catch (Exception ex) // Catch any other errors (file saving or DB)
                    {
                        Console.WriteLine($"CONTROLLER: General Error for {formFile.FileName}. {ex.Message}");
                        result.Success = false;
                        result.ErrorMessage = $"An unexpected error occurred: {ex.Message}";
                        // Attempt cleanup if file might have been saved
                        if (fileSavedSuccessfully) await TryDeletePhysicalFile(filePath, formFile.FileName);
                    }
                }
                else
                {
                    result.Success = false;
                    result.ErrorMessage = "File is empty.";
                }
                results.Add(result);
            } // End for loop

            // --- Return Response ---
            if (results.All(r => r.Success)) { return Ok(results); }
            else if (results.Any(r => r.Success)) { return StatusCode(207, results); } // Partial success
            else
            {
                var errors = results.Select(r => $"{r.OriginalFileName}: {r.ErrorMessage}").ToList();
                return BadRequest(new { message = "All file uploads failed.", errors = errors, results = results });
            }
        }

        // Helper for cleanup on error
        private async Task TryDeletePhysicalFile(string physicalPath, string? originalFileName)
        {
            try
            {
                if (System.IO.File.Exists(physicalPath))
                {
                    Console.WriteLine($"CONTROLLER: Attempting cleanup - deleting {physicalPath}");
                    await Task.Run(() => System.IO.File.Delete(physicalPath));
                    Console.WriteLine($"CONTROLLER: Cleanup successful for {physicalPath}");
                }
            }
            catch (Exception cleanupEx)
            {
                Console.WriteLine($"CONTROLLER: Cleanup Error - Failed to delete {physicalPath} (Original: {originalFileName}). {cleanupEx.Message}");
                // Log this error but don't fail the overall request because of it
            }
        }

        // Other methods...
        [HttpGet]
        public IEnumerable<string> Get() { return new string[] { "value1", "value2" }; }
        [HttpGet("{id}")]
        public string Get(int id) { return "value"; }
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value) { }
        


        [HttpDelete("{pictureId}")] // Use the standard route parameter name
        public async Task<IActionResult> DeletePicture([FromRoute] int pictureId)
        { 
            Console.WriteLine($"CONTROLLER: DeletePicture ID={pictureId}, ContentRootPath='{_hostingEnvironment?.ContentRootPath}'");

            try
            {
                // Call the correct BL method that handles file + DB record deletion
                // Pass ContentRootPath from the injected environment service
                bool deleted = await OhPicture.DeleteSinglePictureAndRecordAsync(
                    pictureId,
                    _context,
                    _hostingEnvironment.ContentRootPath // Pass ContentRootPath
                );

                if (!deleted)
                {
                    // This likely means the picture wasn't found in the database
                    return NotFound(new { message = $"Picture with ID {pictureId} not found." });
                }

                // Success
                return Ok(new { message = "Picture deleted successfully." }); // Or return NoContent()
            }
            // Removed UnauthorizedAccessException catch block
            catch (FileNotFoundException fnfex) // Catch specific exceptions if BL throws them
            {
                // This might occur if DeleteSinglePictureAndRecordAsync re-throws file system errors
                Console.WriteLine($"ERROR in DeletePicture Controller (ID: {pictureId}): File system issue - {fnfex.Message}");
                return StatusCode(500, new { message = "An error occurred deleting the picture file.", error = fnfex.Message });
            }
            catch (InvalidOperationException ioex) // Catch DB save errors from BL
            {
                Console.WriteLine($"ERROR in DeletePicture Controller (ID: {pictureId}): Database update issue - {ioex.Message}");
                return StatusCode(500, new { message = "An error occurred updating the database after picture deletion.", error = ioex.Message });
            }
            catch (Exception ex) // General catch
            {
                Console.WriteLine($"ERROR in DeletePicture Controller (ID: {pictureId}): {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred while deleting the picture.", error = ex.Message });
            }
        }
    }

}
