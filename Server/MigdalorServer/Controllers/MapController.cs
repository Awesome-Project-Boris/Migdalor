using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MigdalorServer.Database;
using MigdalorServer.Models;
using MigdalorServer.Models.DTOs;
using System;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class MapController : ControllerBase
{
    private readonly MigdalorDBContext _context;

    public MapController(MigdalorDBContext context)
    {
        _context = context;
    }

    [HttpGet("initial-data")]
    public async Task<ActionResult<MapDataDto>> GetInitialMapData()
    {
        try
        {
            // 1. Fetch all map nodes.
            var allNodes = await _context.OhMapNodes
                .Select(n => new MapNodeDto
                {
                    NodeID = n.NodeId,
                    Longitude = n.Longitude,
                    Latitude = n.Latitude,
                    Description = n.Description
                })
                .ToListAsync();

            // 2. Fetch residents and group them by apartment.
            var residentsByApartment = (await _context.OhResidents
                .Where(r => r.ResidentApartmentNumber != null)
                .Include(r => r.Resident)
                .Select(r => new {
                    ApartmentGuid = r.ResidentApartmentNumber.Value,
                    ResidentId = r.ResidentId,
                    HebFirstName = r.Resident.HebFirstName,
                    HebLastName = r.Resident.HebLastName,
                    EngFirstName = r.Resident.EngFirstName,
                    EngLastName = r.Resident.EngLastName
                })
                .ToListAsync())
                .GroupBy(x => x.ApartmentGuid)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => new MapResidentDto
                    {
                        ResidentId = x.ResidentId,
                        FullNameHe = $"{x.HebFirstName} {x.HebLastName}",
                        FullNameEn = $"{x.EngFirstName} {x.EngLastName}"
                    }).ToList()
                );

            // 3. Fetch buildings and include their related data directly.
            var buildings = await _context.OhBuildings
                .Include(b => b.Nodes) // Directly includes the related entrance nodes.
                .Include(b => b.OhApartmentPhysicalBuildings) // Includes the apartments.
                .Select(b => new BuildingDto
                {
                    BuildingID = b.BuildingId,
                    BuildingName = b.BuildingName,
                    Coordinates = b.Coordinates,
                    // Get the node IDs from the included navigation property.
                    EntranceNodeIds = b.Nodes.Select(n => n.NodeId).ToList(),
                    Apartments = b.OhApartmentPhysicalBuildings.Select(apt => new MapApartmentDto
                    {
                        ApartmentNumber = apt.ApartmentNumber,
                        ApartmentName = apt.ApartmentName,
                        DisplayNumber = GetApartmentNumberFromGuid(apt.ApartmentNumber),
                        Residents = residentsByApartment.ContainsKey(apt.ApartmentNumber)
                                    ? residentsByApartment[apt.ApartmentNumber]
                                    : new List<MapResidentDto>()
                    }).ToList()
                })
                .ToListAsync();

            var mapData = new MapDataDto
            {
                MapNodes = allNodes,
                Buildings = buildings
            };

            return Ok(mapData);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching initial map data: {ex.ToString()}");
            return StatusCode(500, "An internal server error occurred while fetching map data.");
        }
    }



    private static int GetApartmentNumberFromGuid(Guid guid)
    {
        string guidString = guid.ToString().ToUpper();
        string numberPart = guidString.Split('A').LastOrDefault();
        if (!string.IsNullOrEmpty(numberPart) && int.TryParse(numberPart, out int apartmentNum))
        {
            return apartmentNum;
        }
        return 0;
    }
}