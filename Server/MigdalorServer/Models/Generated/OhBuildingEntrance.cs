using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_BuildingEntrances")]
    // The [Index] attribute might also be here, which is fine.
    public partial class OhBuildingEntrance
    {
        // REMOVE [Key] from here
        [Column("BuildingID")]
        public Guid BuildingId { get; set; }

        // REMOVE [Key] from here
        [Column("NodeID")]
        public int NodeId { get; set; }

        [ForeignKey("BuildingId")]
        [InverseProperty("OhBuildingEntrances")]
        public virtual OhBuilding Building { get; set; } = null!;

        // You should also have a navigation property to OhMapNode
        [ForeignKey("NodeId")]
        [InverseProperty("OhBuildingEntrances")]
        public virtual OhMapNode Node { get; set; } = null!;
    }
}
