using System.ComponentModel.DataAnnotations;

public class ListingUpdateDto
{

    public string Title { get; set; }

    public string? Description { get; set; }

    public int? MainPicId { get; set; }

    public int? ExtraPicId { get; set; }


}