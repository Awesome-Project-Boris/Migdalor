using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Buildings")]
    public partial class OhBuilding
    {

        [InverseProperty("Building")] // This attribute links to the 'Building' property in the OhBuildingEntrance class
        public virtual ICollection<OhBuildingEntrance> OhBuildingEntrances { get; set; }

        public OhBuilding()
        {
            OhApartmentAccessBuildings = new HashSet<OhApartment>();
            OhApartmentPhysicalBuildings = new HashSet<OhApartment>();
            OhBuildingEntrances = new HashSet<OhBuildingEntrance>();
            Nodes = new HashSet<OhMapNode>();
        }

        [Key]
        [Column("BuildingID")]
        public Guid BuildingId { get; set; }
        [StringLength(100)]
        public string BuildingName { get; set; } = null!;
        public string? Info { get; set; }
        public string? Coordinates { get; set; }

        [InverseProperty("AccessBuilding")]
        public virtual ICollection<OhApartment> OhApartmentAccessBuildings { get; set; }
        [InverseProperty("PhysicalBuilding")]
        public virtual ICollection<OhApartment> OhApartmentPhysicalBuildings { get; set; }
        [InverseProperty("Building")]
        public virtual ICollection<OhBuildingEntrance> OhBuildingEntrances { get; set; }
    }
}
