// Server/MigdalorServer/Models/DTOs/GeminiIconRequest.cs
namespace Migdalor.Models.DTOs
{
    /// <summary>
    /// Represents the request for generating an icon with a specific size.
    /// </summary>
    public class GeminiIconRequest
    {
        public string Prompt { get; set; }
        public int Size { get; set; }
    }
}
