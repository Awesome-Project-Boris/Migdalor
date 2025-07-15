// Server/MigdalorServer/Controllers/GeminiController.cs
using Microsoft.AspNetCore.Mvc;
using Migdalor.BL;
using Migdalor.Models.DTOs;
using System.Threading.Tasks;

namespace Migdalor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GeminiController : ControllerBase
    {
        private readonly GeminiService _geminiService;

        public GeminiController(GeminiService geminiService)
        {
            _geminiService = geminiService;
        }

        /// <summary>
        /// Generates content based on a user's prompt.
        /// </summary>
        /// <param name="request">The request containing the prompt.</param>
        /// <returns>The generated content.</returns>
        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] GeminiRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Prompt))
            {
                return BadRequest("Prompt cannot be empty.");
            }

            var result = await _geminiService.GenerateContent(request.Prompt);
            return Ok(new { response = result });
        }

        /// <summary>
        /// Generates an image based on a user's prompt.
        /// </summary>
        /// <param name="request">The request containing the prompt for image generation.</param>
        /// <returns>The generated image data.</returns>
        [HttpPost("generate-image")]
        public async Task<IActionResult> GenerateImage([FromBody] GeminiRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Prompt))
            {
                return BadRequest("Prompt cannot be empty.");
            }

            try
            {
                var result = await _geminiService.GenerateImageAsync(request.Prompt);
                return Ok(new { images = result });
            }
            catch (System.Exception ex)
            {
                // Log the exception
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
