// In your Controllers folder, create a new file InfoSheetController.cs
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MigdalorServer.Database;
using MigdalorServer.Models;

[Route("api/[controller]")]
[ApiController]
public class InfoSheetController : ControllerBase
{
    private readonly MigdalorDBContext _context;

    public InfoSheetController(MigdalorDBContext context)
    {
        _context = context;
    }

    // GET: api/InfoSheet/{language}
    [HttpGet("{language}")]
    public async Task<ActionResult<string>> GetInfoSheet(string language)
    {
        var infoKey = $"info_sheet_{language}";
        var infoSheet = await _context.OhInfoSheets.FindAsync(infoKey);

        if (infoSheet == null)
        {
            return NotFound();
        }

        return infoSheet.InfoValue;
    }

    // PUT: api/InfoSheet/{language}
    [HttpPut("{language}")]
    public async Task<IActionResult> PutInfoSheet(string language, [FromBody] string content)
    {
        var infoKey = $"info_sheet_{language}";
        var infoSheet = await _context.OhInfoSheets.FindAsync(infoKey);

        if (infoSheet == null)
        {
            // Optionally create it if it doesn't exist
            _context.OhInfoSheets.Add(new OhInfoSheet { InfoKey = infoKey, InfoValue = content });
        }
        else
        {
            infoSheet.InfoValue = content;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
