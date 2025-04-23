// Services/ExpoPushService.cs
using MigdalorServer.BL;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;


namespace YourApp.PushNotifications.Services
{
    public class ExpoPushService
    {
        private const string ExpoPushEndpoint = "https://exp.host/--/api/v2/push/send";
        private readonly HttpClient _http;

        public ExpoPushService(HttpClient httpClient)
        {
            _http = httpClient;
        }

        public async Task SendAsync(ExpoPushMessage message)
        {
            if (string.IsNullOrWhiteSpace(message.To))
                throw new ArgumentException("Expo push token must be provided", nameof(message.To));

            var json = JsonSerializer.Serialize(message);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");
            using var response = await _http.PostAsync(ExpoPushEndpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                // You could deserialize the Expo error object here for richer logging
                throw new InvalidOperationException($"Expo push failed ({response.StatusCode}): {error}");
            }
        }

        public async Task SendBulkAsync(IEnumerable<Guid> userIds, ExpoPushMessage template)
        {
            // 1) Look up all non-null, non-empty push tokens for the given user IDs
            using MigdalorDBContext db = new MigdalorDBContext();
            var tokens = await db.OhPeople
                .Where(p => userIds.Contains(p.PersonId)
                            && !string.IsNullOrEmpty(p.PushToken))
                .Select(p => p.PushToken!)
                .ToListAsync();

            if (!tokens.Any())
                return;

            // Chunk into groups of up to 100 messages per Expo’s limit :contentReference[oaicite:2]{index=2}
            const int MaxPerBatch = 100;
            var batches = tokens
                .Select((token, idx) => new { token, idx })
                .GroupBy(x => x.idx / MaxPerBatch)
                .Select(g => g.Select(x => x.token));

            // Send each batch
            foreach (var batch in batches)
            {
                var messages = batch
                    .Select(token => new ExpoPushMessage
                    {
                        To = token,
                        Title = template.Title,
                        Body = template.Body,
                        Sound = template.Sound,
                        Badge = template.Badge,
                        Data = template.Data
                    })
                    .ToArray();

                var json = JsonSerializer.Serialize(messages);
                using var content = new StringContent(json, Encoding.UTF8, "application/json");
                var resp = await _http.PostAsync(ExpoPushEndpoint, content);

                if (!resp.IsSuccessStatusCode)
                {
                    var err = await resp.Content.ReadAsStringAsync();
                    throw new InvalidOperationException(
                        $"Expo batch send failed (HTTP {resp.StatusCode}): {err}"
                    );
                }
            }
        }
    }
}
