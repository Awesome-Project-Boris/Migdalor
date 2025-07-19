// Server/MigdalorServer/BL/GeminiSettings.cs
namespace Migdalor.BL
{
    /// <summary>
    /// Holds the settings for the Gemini API.
    /// </summary>
    public class GeminiSettings
    {
        public string ApiKey { get; set; }
        public string Url { get; set; }
        public string ImageGenerationUrl { get; set; }
    }
}
