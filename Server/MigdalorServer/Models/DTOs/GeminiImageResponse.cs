// Server/MigdalorServer/Models/DTOs/GeminiImageResponse.cs
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Migdalor.Models.DTOs
{
    /// <summary>
    /// Represents the overall response from the Gemini Image Generation API.
    /// </summary>
    public class GeminiImageResponse
    {
        [JsonPropertyName("predictions")]
        public List<Prediction> Predictions { get; set; }
    }

    /// <summary>
    /// Represents a single prediction containing the image data.
    /// </summary>
    public class Prediction
    {
        [JsonPropertyName("bytesBase64Encoded")]
        public string BytesBase64Encoded { get; set; }
    }
}
