using System;
using System.ComponentModel.DataAnnotations;

namespace MigdalorServer.Models.DTOs 
{

    public class ListingCreation
    {

        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public Guid SellerId { get; set; }

        public int? MainPicId { get; set; }  

        public int? ExtraPicId { get; set; } 

    }
}
