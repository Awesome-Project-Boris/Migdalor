using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models;

public partial class OhRoom
{
    public int RoomNumber { get; set; }

    public int BuildingNumber { get; set; }

    [MaxLength(100)]
    public string? RoomName { get; set; }

    [Required]
    public int Capacity { get; set; }
}
