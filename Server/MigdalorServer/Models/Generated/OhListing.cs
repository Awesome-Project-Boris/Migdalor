using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MigdalorServer.Models;

[Table("OH_Listings")]
public partial class OhListing
{
    [Key]
    [Column("ListingID")]
    public int ListingId { get; set; }

    [Column("SellerID")]
    public Guid SellerId { get; set; }

    [StringLength(100)]
    public string Title { get; set; } = null!;

    [StringLength(300)]
    public string? Description { get; set; }

    public bool IsActive { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime Date { get; set; }

    [InverseProperty("Listing")]
    public virtual ICollection<OhPicture> OhPictures { get; set; } = new List<OhPicture>();

    [ForeignKey("SellerId")]
    [InverseProperty("OhListings")]
    public virtual OhPerson Seller { get; set; } = null!;
}
