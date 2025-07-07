namespace MigdalorServer.Models.DTOs
{
    public class SelectOrDeletePictureRequest
    {
        public Guid UserId { get; set; }
        public int PicId { get; set; }
    }
}
