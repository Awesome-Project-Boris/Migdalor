using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_BuildingEntrances")]
    public partial class OhBuildingEntrance
    {
        [Key]
        [Column("BuildingID")]
        public Guid BuildingId { get; set; }
        [Key]
        [Column("NodeID")]
        public int NodeId { get; set; }

        [ForeignKey("BuildingId")]
        [InverseProperty("OhBuildingEntrances")]
        public virtual OhBuilding Building { get; set; } = null!;
    }
}
