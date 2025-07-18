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
        public OhBuilding()
        {
            OhApartmentAccessBuildings = new HashSet<OhApartment>();
            OhApartmentPhysicalBuildings = new HashSet<OhApartment>();
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

        [ForeignKey("BuildingId")]
        [InverseProperty("Buildings")]
        public virtual ICollection<OhMapNode> Nodes { get; set; }
    }
}
