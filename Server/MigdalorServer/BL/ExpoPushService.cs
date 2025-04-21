// Services/ExpoPushService.cs
using MigdalorServer.BL;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;


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
    }
}
