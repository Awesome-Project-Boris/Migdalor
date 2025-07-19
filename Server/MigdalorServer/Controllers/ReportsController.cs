using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class ReportsController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly MigdalorDBContext _context;

        public ReportsController(IWebHostEnvironment hostingEnvironment, MigdalorDBContext context)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
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
                return StatusCode(
                    500,
                    "An internal server error occurred while generating the report."
                );
            }
        }

        // GET: api/reports/list
        [HttpGet("list")]
        public IActionResult GetReportList()
        {
            try
            {
                var reportsPath = Path.Combine(
                    _hostingEnvironment.ContentRootPath,
                    "Reports",
                    "Daily Attendance"
                );
                if (!Directory.Exists(reportsPath))
                {
                    return Ok(new List<string>());
                }

                var reportFiles = Directory
                    .GetFiles(reportsPath, "*.xlsx")
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
                var reportsPath = Path.Combine(
                    _hostingEnvironment.ContentRootPath,
                    "Reports",
                    "Daily Attendance"
                );
                var filePath = Path.Combine(reportsPath, fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound("The requested report file was not found.");
                }

                var memory = new MemoryStream();
                using (var stream = new FileStream(filePath, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0;

                return File(
                    memory,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while downloading the report.");
            }
        }

        // New methods for Classes and Activities reports
        [HttpGet("eventsByDateRange")]
        public async Task<IActionResult> GetEventsByDateRange(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate
        )
        {
            var events = await _context
                .OhEvents.AsNoTracking()
                .Where(e => e.StartDate >= startDate && e.StartDate <= endDate)
                .Select(e => new EventReportDto
                {
                    EventId = e.EventId,
                    EventName = e.EventName,
                    EventDate = e.StartDate,
                    ParticipantCount = e.OhParticipations.Count(),
                })
                .ToListAsync();

            return Ok(events);
        }

        [HttpGet("eventParticipants/{eventId}")]
        public async Task<IActionResult> GetEventParticipants(int eventId)
        {
            var participants = await _context
                .OhParticipations.AsNoTracking()
                .Where(p => p.EventId == eventId)
                .Join(
                    _context.OhPeople,
                    part => part.ParticipantId,
                    person => person.PersonId,
                    (part, person) =>
                        new ParticipantReportDto
                        {
                            ParticipantName = person.HebFirstName + " " + person.HebLastName,
                            Status = part.Status,
                        }
                )
                .ToListAsync();

            return Ok(participants);
        }

        [HttpGet("eventSummary/{eventId}")]
        public async Task<IActionResult> GetEventSummary(int eventId)
        {
            var summary = await _context
                .OhParticipations.AsNoTracking()
                .Where(p => p.EventId == eventId)
                .GroupBy(p => p.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(summary);
        }
    }
}
