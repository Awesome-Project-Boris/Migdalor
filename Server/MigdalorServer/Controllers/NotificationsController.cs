using Microsoft.AspNetCore.Mvc;
using MigdalorServer.BL;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;
using YourApp.PushNotifications.Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MigdalorServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly ExpoPushService _pushService;

        public NotificationsController(ExpoPushService pushService)
        {
            _pushService = pushService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> Send([FromBody] ExpoPushMessage msg)
        {
            try
            {
                await _pushService.SendAsync(msg);
                return Ok(new { status = "success" });
            }
            catch (Exception ex)
            {
                // log the exception...
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("registerToken")]
        public async Task<IActionResult> RegisterToken([FromBody] RegisterPushTokenRequest req)
        {
            using MigdalorDBContext db = new MigdalorDBContext();
            var person = await db.OhPeople.FindAsync(req.PersonId);
            if (person is null)
                return NotFound(new { error = "Person not found" });

            // Update and save
            person.PushToken = req.PushToken;  // OH_People.pushToken :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}
            await db.SaveChangesAsync();

            return Ok(new { status = "token registered" });
        }
    }
}
