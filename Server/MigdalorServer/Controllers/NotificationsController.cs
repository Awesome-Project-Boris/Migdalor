using Microsoft.AspNetCore.Mvc;
using MigdalorServer.BL;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
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

        // POST api/notifications/broadcast
        [HttpPost("broadcast")]
        public async Task<IActionResult> Broadcast([FromBody] ExpoPushMessage template)
        {
            try
            {
                // 1) fetch all user GUIDs
                Guid[] allUserIds = OhPerson.GetAllUserIds();

                // 2) use your existing bulk send method
                await _pushService.SendBulkAsync(allUserIds, template);

                return Ok(new
                {
                    status = "broadcast sent",
                    recipients = allUserIds.Length
                });
            }
            catch (Exception ex)
            {
                // log ex if desired…
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Sends a push notification to all residents who are subscribed to a specific category.
        /// The category is determined from the 'category' property within the message's 'data' object.
        /// </summary>
        /// <param name="message">The Expo push message template. The 'data' object must contain a 'category' property.</param>
        /// <returns>An IActionResult indicating the result of the broadcast operation.</returns>
        /// 

        [HttpPost("broadcastToCategory")]
        public async Task<IActionResult> BroadcastToCategory([FromBody] ExpoPushMessage message)
        {
            // Step 1: Extract the category name from the message's Data payload
            string? categoryName = null;
            if (message.Data is JsonElement dataElement)
            {
                if (dataElement.TryGetProperty("category", out JsonElement categoryElement))
                {
                    categoryName = categoryElement.GetString();
                }
            }

            if (string.IsNullOrEmpty(categoryName))
            {
                return BadRequest(new { error = "The 'data' object in the payload must contain a 'category' property with a valid category name." });
            }

            try
            {
                // Step 2: Use Entity Framework to get the list of subscribed resident IDs
                using var db = new MigdalorDBContext();

                // First, find all residents who have explicitly unsubscribed from this category.
                // This respects the "subscribed by default" logic where no record means subscribed.
                var unsubscribedResidentIds = await db.OhResidentCategorySubscriptions
    .Where(s => s.CategoryHebName == categoryName)
    .Where(s => s.IsSubscribed == false)
    .Select(s => s.ResidentId)
    .ToListAsync();

                // Next, get all active residents whose IDs are NOT in the unsubscribed list.
                // We also join with OhPeople to ensure they have a push token.
                var subscribedUserIds = await db.OhResidents
                    .Where(r => r.IsActive == true)
                    .Where(r => !unsubscribedResidentIds.Contains(r.ResidentId))
                    .Join(db.OhPeople, // Join to access the PushToken
                          resident => resident.ResidentId,
                          person => person.PersonId,
                          (resident, person) => new { resident.ResidentId, person.PushToken })
                    .Where(joined => !string.IsNullOrEmpty(joined.PushToken)) // Ensure they have a token to receive a notification
                    .Select(joined => joined.ResidentId)
                    .ToArrayAsync();

                // Step 3: Use the existing bulk send service to send the notifications
                if (subscribedUserIds.Length > 0)
                {
                    await _pushService.SendBulkAsync(subscribedUserIds, message);
                }

                return Ok(new
                {
                    status = "Category broadcast sent",
                    category = categoryName,
                    recipients = subscribedUserIds.Length
                });
            }
            catch (Exception ex)
            {
                // In a production environment, you would log this exception
                Console.WriteLine($"Error in BroadcastToCategory: {ex}");
                return StatusCode(500, new { error = "An internal server error occurred while sending the category broadcast." });
            }
        }
    }
}
