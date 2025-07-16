using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MigdalorServer.Models;

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class ReportsController : ControllerBase
    {
        // GET: api/reports/bokertov?startDate=2023-01-01&endDate=2023-01-31
        [HttpGet("bokertov")]
        public async Task<IActionResult> GetBokerTovReport(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate
        )
        {
            if (startDate > endDate)
            {
                return BadRequest("Start date cannot be after end date.");
            }

            try
            {
                var report = await OhBokerTov.GetBokerTovReportAsync(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                // In a real app, you would log this exception
                return StatusCode(
                    500,
                    "An internal server error occurred while generating the report."
                );
            }
        }
    }
}
