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
using System.Security.Claims;
using MigdalorServer.Models.DTOs;
using Microsoft.AspNetCore.Authorization;

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
    [FromForm] Guid uploaderId)
        {
            // --- Validation (Your original logic) ---
            if (files == null || !files.Any()) return BadRequest(new { message = "No files provided." });
            if (picRoles == null || picAlts == null || files.Count != picRoles.Count || files.Count != picAlts.Count)
                return BadRequest(new { message = "Mismatch between number of files, roles, and alt texts." });

            var results = new List<FileUploadResult>();

            // --- CORRECTED PATH: Points to 'uploadedFiles' as configured in Program.cs ---
            string uploadsFolderPath = Path.Combine(_hostingEnvironment.ContentRootPath, "uploadedFiles");
            Directory.CreateDirectory(uploadsFolderPath); // Ensures the directory exists

            for (int i = 0; i < files.Count; i++)
            {
                var formFile = files[i];
                var picRole = picRoles[i];
                var picAlt = picAlts[i];
                var result = new FileUploadResult { OriginalFileName = formFile.FileName };

                // --- Your original input validation ---
                if (string.IsNullOrWhiteSpace(picRole))
                {
                    result.Success = false; result.ErrorMessage = $"Role is missing for file {formFile.FileName ?? $"#{i + 1}"}."; results.Add(result); continue;
                }
                if (string.IsNullOrWhiteSpace(picAlt))
                {
                    result.Success = false; result.ErrorMessage = $"Alt text is missing for file {formFile.FileName ?? $"#{i + 1}"}."; results.Add(result); continue;
                }

                if (formFile.Length > 0)
                {
                    // The call to enforce history limits remains here
                    try
                    {
                        await CheckAndEnforceHistoryLimit(uploaderId, picRole);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"NON-CRITICAL ERROR: Could not enforce history limit for user {uploaderId} and role {picRole}. Reason: {ex.Message}");
                    }

                    string uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(formFile.FileName)}";
                    string physicalFilePath = Path.Combine(uploadsFolderPath, uniqueFileName);
                    string relativeWebPath = $"/Images/{uniqueFileName}"; // This path is correctly mapped
                    bool fileSavedSuccessfully = false;

                    // --- Your original, detailed try/catch block for saving and DB record creation ---
                    try
                    {
                        using (var stream = new FileStream(physicalFilePath, FileMode.Create))
                        {
                            await formFile.CopyToAsync(stream);
                        }
                        fileSavedSuccessfully = true;

                        OhPicture savedPicture = await OhPicture.CreatePictureRecordAsync(_context, uniqueFileName, relativeWebPath, picRole, picAlt, uploaderId);

                        result.Success = true;
                        result.ServerPath = relativeWebPath;
                        result.PicId = savedPicture.PicId;
                    }
                    catch (DbUpdateException dbEx)
                    {
                        result.Success = false;
                        result.ErrorMessage = $"Database error saving metadata: {dbEx.InnerException?.Message ?? dbEx.Message}";
                        if (fileSavedSuccessfully) await TryDeletePhysicalFile(relativeWebPath);
                    }
                    catch (ArgumentNullException argEx)
                    {
                        result.Success = false;
                        result.ErrorMessage = $"Invalid data provided: {argEx.ParamName}";
                    }
                    catch (IOException ioEx)
                    {
                        result.Success = false;
                        result.ErrorMessage = $"Failed to save file: {ioEx.Message}";
                    }
                    catch (Exception ex)
                    {
                        result.Success = false;
                        result.ErrorMessage = $"An unexpected error occurred: {ex.Message}";
                        if (fileSavedSuccessfully) await TryDeletePhysicalFile(relativeWebPath);
                    }
                }
                else
                {
                    result.Success = false;
                    result.ErrorMessage = "File is empty.";
                }
                results.Add(result);
            }

            // --- Your original return logic ---
            if (results.All(r => r.Success)) { return Ok(results); }
            else if (results.Any(r => r.Success)) { return StatusCode(207, results); }
            else
            {
                var errors = results.Select(r => $"{r.OriginalFileName}: {r.ErrorMessage}").ToList();
                return BadRequest(new { message = "All file uploads failed.", errors = errors, results = results });
            }
        }

        // --- NEW METHOD FOR ADMIN PANEL UPLOAD ---
        [HttpPost("UploadAdmin")]
        [Authorize] // Ensure only authenticated users can upload
        public async Task<IActionResult> UploadAdminPicture([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file provided or file is empty." });
            }

            // Get the ID of the logged-in user (the admin) from the token claims
            var uploaderIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(uploaderIdString, out Guid uploaderId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            // Use the same file-saving logic as your existing Post method for consistency
            string uploadsFolderPath = Path.Combine(_hostingEnvironment.ContentRootPath, "uploadedFiles");
            Directory.CreateDirectory(uploadsFolderPath); // Ensure the directory exists

            try
            {
                string uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                string physicalFilePath = Path.Combine(uploadsFolderPath, uniqueFileName);
                string relativeWebPath = $"/Images/{uniqueFileName}";

                // Save the physical file
                using (var stream = new FileStream(physicalFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create the database record
                // For an admin upload, we can set default role and alt text
                string picRole = "profile_picture";
                string picAlt = $"Profile picture uploaded by admin on {DateTime.UtcNow:yyyy-MM-dd}";

                OhPicture savedPicture = await OhPicture.CreatePictureRecordAsync(_context, uniqueFileName, relativeWebPath, picRole, picAlt, uploaderId);

                // Return the ID of the new picture, which the frontend needs
                return Ok(savedPicture.PicId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UploadAdminPicture: {ex.Message}");
                return StatusCode(500, new { message = "An internal server error occurred during file upload." });
            }
        }

        private async Task TryDeletePhysicalFile(string relativeWebPath)
        {
            if (string.IsNullOrEmpty(relativeWebPath)) return;

            string fileName = Path.GetFileName(relativeWebPath);
            string physicalPath = Path.Combine(_hostingEnvironment.ContentRootPath, "uploadedFiles", fileName);

            try
            {
                if (System.IO.File.Exists(physicalPath))
                {
                    await Task.Run(() => System.IO.File.Delete(physicalPath));
                    Console.WriteLine($"SUCCESS: Deleted physical file: {physicalPath}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR: Failed to delete physical file {physicalPath}. Reason: {ex.Message}");
            }
        }

        //[HttpGet]
        //public IEnumerable<string> Get() { return new string[] { "value1", "value2" }; }

        //[HttpGet("{id}")]
        //public string Get(int id) { return "value"; }

        //[HttpPut("{id}")]
        //public void Put(int id, [FromBody] string value) { }



        // --- REFACTORED DELETE Method ---

        [HttpPost("delete")]
        public async Task<IActionResult> DeletePicture([FromBody] SelectOrDeletePictureRequest request)
        {
            try
            {
                // 1. Fetch the picture to check its role first
                var pictureToDelete = await _context.OhPictures.FirstOrDefaultAsync(p => p.PicId == request.PicId);

                if (pictureToDelete == null) return NoContent();
                if (pictureToDelete.UploaderId != request.UserId) return Forbid("You do not have permission to delete this picture.");

                // --- START: NEW ROLE-AWARE CHECK ---

                // 2. Only check for profile usage IF the picture's role is relevant to profiles.
                if (pictureToDelete.PicRole == "profile_picture" || pictureToDelete.PicRole == "secondary_profile")
                {
                    bool isUsedAsProfilePic = await _context.OhPeople.AnyAsync(p => p.ProfilePicId == request.PicId);
                    bool isUsedAsAdditionalPic = await _context.OhResidents
                        .AnyAsync(r => r.AdditionalPic1Id == request.PicId || r.AdditionalPic2Id == request.PicId);

                    // If the picture is used in either profile slot, block deletion.
                    if (isUsedAsProfilePic || isUsedAsAdditionalPic)
                    {
                        Console.WriteLine($"INFO: Deletion skipped for picture ID {request.PicId} because it is currently in use on a profile.");
                        return Conflict(new { message = "This picture cannot be deleted because it is currently in use." });
                    }
                }
                // --- END: NEW ROLE-AWARE CHECK ---

                // 3. For all other roles (like 'marketplace') or if the profile-related check passes,
                // proceed with deletion.
                _context.OhPictures.Remove(pictureToDelete);
                await _context.SaveChangesAsync();
                await TryDeletePhysicalFile(pictureToDelete.PicPath);

                return NoContent(); // Success
            }
            catch (Exception ex)
            {
                // It's good practice to log the full exception
                Console.WriteLine($"ERROR in DeletePicture: {ex.ToString()}");
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }



        [HttpPost("history")]
        public async Task<IActionResult> GetPictureHistory([FromBody] PictureHistoryRequest request)
        {
            try
            {
                if (request == null) return BadRequest("Request body is null.");

                var pictures = await _context.OhPictures
                    .Where(p => p.UploaderId == request.UserId && p.PicRole == request.Role)
                    .OrderByDescending(p => p.DateTime)
                    .Select(p => new { p.PicId, p.PicName, p.PicPath, p.PicAlt, p.DateTime })
                    .ToListAsync();
                return Ok(pictures);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An internal server error occurred: {ex.Message}");
            }
        }


        [HttpPut("select")]
        public async Task<IActionResult> SelectPicture([FromBody] SelectOrDeletePictureRequest request)
        {
            try
            {
                var pictureToUpdate = await _context.OhPictures.FirstOrDefaultAsync(p => p.PicId == request.PicId);
                if (pictureToUpdate == null) return NotFound("Picture not found.");
                if (pictureToUpdate.UploaderId != request.UserId) return Forbid("You do not have permission to modify this picture.");

                pictureToUpdate.DateTime = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(pictureToUpdate);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


        private async Task CheckAndEnforceHistoryLimit(Guid userId, string role)
        {
            int limit = role switch
            {
                "profile_picture" => 5,
                "secondary_profile" => 3,
                _ => 0
            };
            if (limit == 0) return;

            // Get all pictures for this role, sorted with the oldest ones first.
            var pictures = await _context.OhPictures
                .Where(p => p.UploaderId == userId && p.PicRole == role)
                .OrderBy(p => p.DateTime)
                .ToListAsync();

            // Only run if the number of pictures is at or over the limit.
            if (pictures.Count >= limit)
            {
                int attempts = 0;
                const int maxAttempts = 3; 

                // Loop through the oldest pictures.
                foreach (var picToDelete in pictures)
                {
                    if (attempts >= maxAttempts)
                    {
                        Console.WriteLine($"INFO: Halting history cleanup after {maxAttempts} attempts as all candidates were in use.");
                        break; // Stop after 3 tries.
                    }

                    attempts++; // Count this as an attempt.

                    // Check if the picture is currently in use in either table.
                    bool isUsedAsProfilePic = await _context.OhPeople.AnyAsync(p => p.ProfilePicId == picToDelete.PicId);
                    bool isUsedAsAdditionalPic = await _context.OhResidents.AnyAsync(r => r.AdditionalPic1Id == picToDelete.PicId || r.AdditionalPic2Id == picToDelete.PicId);

                    // If the picture is NOT in use, delete it and stop.
                    if (!isUsedAsProfilePic && !isUsedAsAdditionalPic)
                    {
                        _context.OhPictures.Remove(picToDelete);
                        await _context.SaveChangesAsync();
                        await TryDeletePhysicalFile(picToDelete.PicPath);
                        Console.WriteLine($"SUCCESS: History limit enforced by deleting unused picture ID {picToDelete.PicId} on attempt #{attempts}.");
                        return; // Exit successfully after deleting one picture.
                    }
                    else
                    {
                        Console.WriteLine($"INFO: Attempt #{attempts}: Could not delete picture ID {picToDelete.PicId} because it is in use.");
                    }
                }
            }
        }
    }

}
