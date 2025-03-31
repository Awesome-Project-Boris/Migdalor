using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models;

[PrimaryKey("RoomNumber", "BuildingNumber")]
[Table("OH_Rooms")]
public partial class OhRoom
{
    [Key]
    [Column("roomNumber")]
    public int RoomNumber { get; set; }

    [Key]
    [Column("buildingNumber")]
    public int BuildingNumber { get; set; }

    [Column("roomName")]
    [StringLength(100)]
    public string? RoomName { get; set; }

    [Column("capacity")]
    public int Capacity { get; set; }
}
