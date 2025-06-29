using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models
{
    [Table("OH_Permissions")]
    public partial class OhPermission
    {
        public OhPermission()
        {
            People = new HashSet<OhPerson>();
        }

        [Key]
        [Column("permissionName")]
        [StringLength(100)]
        public string PermissionName { get; set; } = null!;

        [ForeignKey("PermissionName")]
        [InverseProperty("PermissionNames")]
        public virtual ICollection<OhPerson> People { get; set; }
    }
}
