// Server/MigdalorServer/BL/GeminiService.cs
using Microsoft.Extensions.Options;
using Migdalor.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Migdalor.BL
{
    /// <summary>
    /// Service to interact with the Google Gemini API.
    /// </summary>
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly GeminiSettings _geminiSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="GeminiService"/> class.
        /// </summary>
        /// <param name="httpClient">The HTTP client.</param>
        /// <param name="geminiSettings">The Gemini API settings.</param>
        public GeminiService(HttpClient httpClient, IOptions<GeminiSettings> geminiSettings)
        {
            _httpClient = httpClient;
            _geminiSettings = geminiSettings.Value;
        }

        /// <summary>
        /// Generates content using the Gemini API based on a given prompt.
        /// This has been updated to handle an array response from the API and concatenate the full response.
        /// </summary>
        /// <param name="prompt">The prompt to send to the API.</param>
        /// <returns>The generated content as a string.</returns>
        public async Task<string> GenerateContent(string prompt)
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var requestUri = $"{_geminiSettings.Url}?key={_geminiSettings.ApiKey}";
            var response = await _httpClient.PostAsync(requestUri, content);

            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();
                var fullResponse = new StringBuilder();
                // Parse the response to extract the generated text
                using (JsonDocument doc = JsonDocument.Parse(responseString))
                {
                    // Handle array response by iterating through each chunk
                    foreach (JsonElement element in doc.RootElement.EnumerateArray())
                    {
                        if (element.TryGetProperty("candidates", out JsonElement candidates) && candidates.GetArrayLength() > 0)
                        {
                            if (candidates[0].TryGetProperty("content", out JsonElement contentElement) && contentElement.TryGetProperty("parts", out JsonElement parts) && parts.GetArrayLength() > 0)
                            {
                                if (parts[0].TryGetProperty("text", out JsonElement textElement))
                                {
                                    fullResponse.Append(textElement.GetString());
                                }
                            }
                        }
                    }
                }

                if (fullResponse.Length > 0)
                {
                    return fullResponse.ToString();
                }

                return "Could not parse the response from Gemini API.";
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return $"Error: {response.StatusCode}, {errorContent}";
            }
        }

        /// <summary>
        /// Generates an image using the Gemini API based on a given prompt.
        /// This has been updated to handle an array response from the API.
        /// </summary>
        /// <param name="prompt">The prompt to send to the API for image generation.</param>
        /// <returns>A list of base64 encoded strings representing the generated images.</returns>
        public async Task<List<string>> GenerateImageAsync(string prompt)
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    responseModalities = new[] { "IMAGE", "TEXT" }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var requestUri = $"{_geminiSettings.ImageGenerationUrl}?key={_geminiSettings.ApiKey}";
            var response = await _httpClient.PostAsync(requestUri, content);

            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();
                using (JsonDocument doc = JsonDocument.Parse(responseString))
                {
                    var images = new List<string>();
                    // The root of the response is an array of candidates
                    foreach (JsonElement candidate in doc.RootElement.EnumerateArray())
                    {
                        if (candidate.TryGetProperty("candidates", out JsonElement candidates) && candidates.GetArrayLength() > 0)
                        {
                            foreach (JsonElement innerCandidate in candidates.EnumerateArray())
                            {
                                if (innerCandidate.TryGetProperty("content", out JsonElement contentElement) &&
                                    contentElement.TryGetProperty("parts", out JsonElement parts))
                                {
                                    foreach (JsonElement part in parts.EnumerateArray())
                                    {
                                        if (part.TryGetProperty("inlineData", out JsonElement inlineData) &&
                                            inlineData.TryGetProperty("data", out JsonElement data))
                                        {
                                            images.Add(data.GetString());
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (images.Any())
                    {
                        return images;
                    }
                }
                throw new Exception("Failed to parse image data from Gemini API response.");
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Error from Gemini API: {response.StatusCode}, {errorContent}");
            }
        }
    }
}
