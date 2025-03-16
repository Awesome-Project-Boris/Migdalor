using Microsoft.Data.SqlClient;
namespace MigdalorServer.BL
{
    public class Picture
    {
        private int picId;
        private string picName;
        private string picPath;
        private string picAlt;

        public Picture() { }
        public Picture(int picId, string picName, string picPath, string picAlt)
        {
            PicId = picId;
            PicName = picName;
            PicPath = picPath;
            PicAlt = picAlt;
        }

        public int PicId { get => picId; set => picId = value; }
        public string PicName { get => picName; set => picName = value; }
        public string PicPath { get => picPath; set => picPath = value; }
        public string PicAlt { get => picAlt; set => picAlt = value; }
    }
}
