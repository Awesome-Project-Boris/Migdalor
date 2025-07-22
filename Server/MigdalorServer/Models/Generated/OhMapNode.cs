using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_MapNodes")]
    public partial class OhMapNode
    {
        public OhMapNode()
        {
            Buildings = new HashSet<OhBuilding>();
        }

        [Key]
        [Column("NodeID")]
        public int NodeId { get; set; }
        public double Longitude { get; set; }
        public double Latitude { get; set; }
        [StringLength(255)]
        public string? Description { get; set; }

        [ForeignKey("NodeId")]
        [InverseProperty("Nodes")]
        public virtual ICollection<OhBuilding> Buildings { get; set; }
    }
}
