using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Apartments")]
    public partial class OhApartment
    {
        public OhApartment()
        {
            OhResidents = new HashSet<OhResident>();
        }

        [Key]
        public Guid ApartmentNumber { get; set; }
        [Column("PhysicalBuildingID")]
        public Guid PhysicalBuildingId { get; set; }
        [Column("AccessBuildingID")]
        public Guid AccessBuildingId { get; set; }
        public int? FloorNumber { get; set; }
        [StringLength(100)]
        public string? ApartmentName { get; set; }

        [ForeignKey("AccessBuildingId")]
        [InverseProperty("OhApartmentAccessBuildings")]
        public virtual OhBuilding AccessBuilding { get; set; } = null!;
        [ForeignKey("PhysicalBuildingId")]
        [InverseProperty("OhApartmentPhysicalBuildings")]
        public virtual OhBuilding PhysicalBuilding { get; set; } = null!;
        [InverseProperty("ResidentApartmentNumberNavigation")]
        public virtual ICollection<OhResident> OhResidents { get; set; }
    }
}
