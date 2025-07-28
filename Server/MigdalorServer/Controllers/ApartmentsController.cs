using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;

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

    [HttpGet("existing-numbers")]
    public async Task<ActionResult<IEnumerable<int>>> GetExistingApartmentNumbers()
    {
        try
        {
            var apartments = await _context.OhApartments.ToListAsync();
            var apartmentNumbers = apartments
                .Select(a => GetApartmentNumberFromGuid(a.ApartmentNumber))
                .Where(n => n != -1)
                .OrderBy(n => n)
                .ToList();

            return Ok(apartmentNumbers);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching existing apartment numbers: {ex.Message}");
            return StatusCode(500, "An internal server error occurred.");
        }
    }

    [HttpGet("{apartmentNumber}")]
    public async Task<ActionResult<ApartmentDto>> GetApartmentByNumber(int apartmentNumber)
    {
        if (apartmentNumber <= 0)
        {
            return BadRequest("Invalid apartment number.");
        }

        var targetGuidSuffix = $"A{apartmentNumber:D4}";

        var apartment = await _context
            .OhApartments.Where(a =>
                a.ApartmentNumber.ToString().ToUpper().EndsWith(targetGuidSuffix)
            )
            .Select(a => new ApartmentDto
            {
                ApartmentNumber = a.ApartmentNumber,
                DisplayNumber = apartmentNumber,
                PhysicalBuildingID = a.PhysicalBuildingId,
                AccessBuildingID = a.AccessBuildingId,
            })
            .FirstOrDefaultAsync();

        if (apartment == null)
        {
            return NotFound($"Apartment number {apartmentNumber} not found.");
        }

        return Ok(apartment);
    }

    [HttpPost("find-or-create")]
    public async Task<ActionResult<OhApartment>> GetOrCreateApartment(
        [FromBody] ApartmentRequestDto request
    )
    {
        if (request == null || request.ApartmentNumber <= 0)
        {
            return BadRequest("A valid apartment number must be provided.");
        }

        var allApartments = await _context.OhApartments.ToListAsync();
        foreach (var apt in allApartments)
        {
            if (GetApartmentNumberFromGuid(apt.ApartmentNumber) == request.ApartmentNumber)
            {
                return Ok(apt);
            }
        }

        var (physicalBuildingId, accessBuildingId) = GetBuildingIdsForApartment(
            request.ApartmentNumber
        );

        if (physicalBuildingId == Guid.Empty)
        {
            return BadRequest(
                $"Apartment number {request.ApartmentNumber} is not a valid potential apartment."
            );
        }

        var newApartment = new OhApartment
        {
            ApartmentNumber = CreateGuidFromApartmentNumber(request.ApartmentNumber),
            PhysicalBuildingId = physicalBuildingId,
            AccessBuildingId = accessBuildingId,
            ApartmentName = $"MapScreen_Apartment",
        };

        try
        {
            _context.OhApartments.Add(newApartment);
            await _context.SaveChangesAsync();
            return CreatedAtAction(
                nameof(GetOrCreateApartment),
                new { id = newApartment.ApartmentNumber },
                newApartment
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating apartment: {ex.Message}");
            return StatusCode(500, "An error occurred while creating the apartment.");
        }
    }

    private int GetApartmentNumberFromGuid(Guid guid)
    {
        string guidString = guid.ToString().ToUpper();
        string? numberPart = guidString.Split('A').LastOrDefault();
        if (!string.IsNullOrEmpty(numberPart) && int.TryParse(numberPart, out int apartmentNum))
        {
            return apartmentNum;
        }
        return -1;
    }

    private Guid CreateGuidFromApartmentNumber(int apartmentNumber)
    {
        string formattedNumber = apartmentNumber.ToString("D4");
        return new Guid($"00000000-0000-0000-0000-0000000A{formattedNumber}");
    }

    private (Guid Physical, Guid Access) GetBuildingIdsForApartment(int aptNum)
    {
        if (
            (aptNum >= 101 && aptNum <= 120)
            || (aptNum >= 201 && aptNum <= 220)
            || (aptNum >= 301 && aptNum <= 332)
            || (aptNum >= 401 && aptNum <= 432)
        )
        {
            Guid accessId = (aptNum >= 401 && aptNum <= 432) ? B2_GUID : B1_GUID;
            return (B1_GUID, accessId);
        }

        if (
            (aptNum >= 131 && aptNum <= 149)
            || (aptNum >= 231 && aptNum <= 249)
            || (aptNum >= 331 && aptNum <= 349)
            || (aptNum >= 431 && aptNum <= 449)
        )
        {
            return (B2_GUID, B2_GUID);
        }

        return (Guid.Empty, Guid.Empty);
    }
}
