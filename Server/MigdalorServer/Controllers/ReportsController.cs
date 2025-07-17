using Microsoft.AspNetCore.Mvc;
using MigdalorServer.Models;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Linq;
using System.Collections.Generic;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class ReportsController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostingEnvironment;

        public ReportsController(IWebHostEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        // GET: api/reports/bokertov
        [HttpGet("bokertov")]
        public async Task<IActionResult> GetBokerTovReport()
        {
            try
            {
                var report = await OhBokerTov.GetAllBokerTovReportAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An internal server error occurred while generating the report.");
            }
        }

        // GET: api/reports/list
        [HttpGet("list")]
        public IActionResult GetReportList()
        {
            try
            {
                var reportsPath = Path.Combine(_hostingEnvironment.ContentRootPath, "Reports", "Daily Attendance");
                if (!Directory.Exists(reportsPath))
                {
                    return Ok(new List<string>());
                }

                var reportFiles = Directory.GetFiles(reportsPath, "*.xlsx")
                                           .Select(Path.GetFileName)
                                           .OrderByDescending(f => f)
                                           .ToList();

                return Ok(reportFiles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the list of reports.");
            }
        }

        // UPDATED: GET api/reports/download/{fileName}
        [HttpGet("download/{fileName}")]
        public async Task<IActionResult> DownloadReport(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                return BadRequest("File name cannot be empty.");
            }

            try
            {
                var reportsPath = Path.Combine(_hostingEnvironment.ContentRootPath, "Reports", "Daily Attendance");
                var filePath = Path.Combine(reportsPath, fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound("The requested report file was not found.");
                }

                // Read the file into a memory stream to ensure it's fully loaded before sending.
                // This is a more robust method that prevents file corruption during transit.
                var memory = new MemoryStream();
                using (var stream = new FileStream(filePath, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0; // Reset the stream position to the beginning

                // Return the file from memory
                return File(memory, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                // In a real app, you would log this exception
                return StatusCode(500, "An error occurred while downloading the report.");
            }
        }
    }
}