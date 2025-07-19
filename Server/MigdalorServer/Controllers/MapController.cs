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

            // 2. Fetch all residents and group them by apartment for fast lookup.
            var residentsByApartment = (await _context.OhResidents
                .Where(r => r.ResidentApartmentNumber != null)
                .Select(r => new {
                    ApartmentGuid = r.ResidentApartmentNumber.Value,
                    ResidentId = r.ResidentId,
                    // Make sure the r.Resident navigation property is correctly configured.
                    FullNameHe = r.Resident.HebFirstName + " " + r.Resident.HebLastName,
                    FullNameEn = r.Resident.EngFirstName + " " + r.Resident.EngLastName
                })
                .ToListAsync())
                .GroupBy(x => x.ApartmentGuid)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => new MapResidentDto
                    {
                        ResidentId = x.ResidentId,
                        FullNameHe = x.FullNameHe,
                        FullNameEn = x.FullNameEn
                    }).ToList()
                );

            // 3. Fetch all building entrances separately and group them by BuildingID.
            // This is the key step that avoids the error.
            var entrancesByBuilding = (await _context.Set<OhBuildingEntrance>()
    .Select(e => new { e.BuildingId, e.NodeId })
                .ToListAsync())
                .GroupBy(e => e.BuildingId)
                .ToDictionary(g => g.Key, g => g.Select(e => e.NodeId).ToList());

            // 4. Fetch all buildings. We will attach related data manually.
            var buildings = await _context.OhBuildings
                .Include(b => b.OhApartmentPhysicalBuildings) // This include works because the property exists
                .Select(b => new BuildingDto
                {
                    BuildingID = b.BuildingId,
                    BuildingName = b.BuildingName,
                    Coordinates = b.Coordinates,

                    // Manually look up the entrances from the dictionary created in step 3.
                    EntranceNodeIds = entrancesByBuilding.ContainsKey(b.BuildingId)
                                      ? entrancesByBuilding[b.BuildingId]
                                      : new List<int>(),

                    // Map the apartments from the included navigation property.
                    Apartments = b.OhApartmentPhysicalBuildings.Select(apt => new MapApartmentDto
                    {
                        ApartmentNumber = apt.ApartmentNumber,
                        ApartmentName = apt.ApartmentName,
                        DisplayNumber = GetApartmentNumberFromGuid(apt.ApartmentNumber), // Assuming this helper method exists
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