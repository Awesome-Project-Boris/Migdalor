using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ApartmentsController : ControllerBase
{
    private readonly MigdalorDBContext _context;

    public ApartmentsController(MigdalorDBContext context)
    {
        _context = context;
    }

    private static readonly Guid B1_GUID = new Guid("00000000-0000-0000-0000-0000000000B1");
    private static readonly Guid B2_GUID = new Guid("00000000-0000-0000-0000-0000000000B2");

    /// <summary>
    /// Gets a simplified list of all existing apartment numbers.
    /// </summary>
    /// <returns>A list of integers representing the apartment numbers.</returns>
    [HttpGet("existing-numbers")]
    public async Task<ActionResult<IEnumerable<int>>> GetExistingApartmentNumbers()
    {
        try
        {
            var apartmentGuids = await _context.OhApartments
                .Select(a => a.ApartmentNumber)
                .ToListAsync();

            var apartmentNumbers = new List<int>();

            foreach (var guid in apartmentGuids)
            {
                string guidString = guid.ToString().ToUpper();
                string? numberPart = guidString.Split('A').LastOrDefault();

                if (!string.IsNullOrEmpty(numberPart) && int.TryParse(numberPart, out int apartmentNum))
                {
                    apartmentNumbers.Add(apartmentNum);
                }
            }

            return Ok(apartmentNumbers.OrderBy(n => n));
        }
        catch (Exception ex)
        {
            // Log the exception (using your preferred logging framework)
            Console.WriteLine($"Error fetching existing apartment numbers: {ex.Message}");
            return StatusCode(500, "An internal server error occurred.");
        }
    }


    // <summary>
    /// Finds an existing apartment by its number or creates a new one if it's a valid "potential" apartment.
    /// </summary>
    /// <param name="request">DTO containing the integer apartment number.</param>
    /// <returns>The full details of the found or created apartment.</returns>
    [HttpPost("find-or-create")]
    public async Task<ActionResult<OhApartment>> GetOrCreateApartment([FromBody] ApartmentRequestDto request)
    {
        if (request == null || request.ApartmentNumber <= 0)
        {
            return BadRequest("A valid apartment number must be provided.");
        }

        // --- Step 1: Check if the apartment already exists ---
        // We must iterate because we can't efficiently query the GUID by the integer part.
        var allApartments = await _context.OhApartments.ToListAsync();
        foreach (var apt in allApartments)
        {
            if (GetApartmentNumberFromGuid(apt.ApartmentNumber) == request.ApartmentNumber)
            {
                return Ok(apt); // Found it, return the existing apartment.
            }
        }

        // --- Step 2: If it doesn't exist, validate and create it ---
        var (physicalBuildingId, accessBuildingId) = GetBuildingIdsForApartment(request.ApartmentNumber);

        if (physicalBuildingId == Guid.Empty)
        {
            // If no valid building was found, the apartment number is not in any of the potential ranges.
            return BadRequest($"Apartment number {request.ApartmentNumber} is not a valid potential apartment.");
        }

        // --- Step 3: Create the new apartment ---
        var newApartment = new OhApartment
        {
            ApartmentNumber = CreateGuidFromApartmentNumber(request.ApartmentNumber),
            PhysicalBuildingId = physicalBuildingId, // Corrected from PhysicalBuildingID
            AccessBuildingId = accessBuildingId,   // Corrected from AccessBuildingID
            ApartmentName = $"Apartment {request.ApartmentNumber}"
        };

        try
        {
            _context.OhApartments.Add(newApartment);
            await _context.SaveChangesAsync();

            // Return a 201 Created status with the new apartment's data.
            return CreatedAtAction(nameof(GetOrCreateApartment), new { id = newApartment.ApartmentNumber }, newApartment);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating apartment: {ex.Message}");
            return StatusCode(500, "An error occurred while creating the apartment.");
        }
    }

    // --- Private Helper Methods ---

    private int GetApartmentNumberFromGuid(Guid guid)
    {
        string guidString = guid.ToString().ToUpper();
        string? numberPart = guidString.Split('A').LastOrDefault();
        if (!string.IsNullOrEmpty(numberPart) && int.TryParse(numberPart, out int apartmentNum))
        {
            return apartmentNum;
        }
        return -1; // Should not happen with well-formed data
    }

    private Guid CreateGuidFromApartmentNumber(int apartmentNumber)
    {
        // Creates a GUID in the format "00000000-0000-0000-0000-0000000AXXXX"
        string formattedNumber = apartmentNumber.ToString("D4"); // e.g., 43 -> "0043"
        return new Guid($"00000000-0000-0000-0000-0000000A{formattedNumber}");
    }

    private (Guid Physical, Guid Access) GetBuildingIdsForApartment(int aptNum)
    {
        // Building B1: 101-120, 201-220, 301-332, 401-432
        if ((aptNum >= 101 && aptNum <= 120) ||
            (aptNum >= 201 && aptNum <= 220) ||
            (aptNum >= 301 && aptNum <= 332) || // Access is B1
            (aptNum >= 401 && aptNum <= 432))   // Access is B2
        {
            Guid accessId = (aptNum >= 401 && aptNum <= 432) ? B2_GUID : B1_GUID;
            return (B1_GUID, accessId);
        }

        // Building B2: 131-149, 231-249, 331-349, 431-449
        if ((aptNum >= 131 && aptNum <= 149) ||
            (aptNum >= 231 && aptNum <= 249) ||
            (aptNum >= 331 && aptNum <= 349) || // Access is B2
            (aptNum >= 431 && aptNum <= 449))   // Access is B2
        {
            return (B2_GUID, B2_GUID);
        }

        return (Guid.Empty, Guid.Empty); // Not a valid potential apartment
    }
}