namespace MigdalorServer.Models.DTOs
{
    public class UserSetting
    {
        public Guid UserId { get; set; }
        public string UserSelectedDirection { get; set; } = "rtl";
        public int UserSelectedFontSize { get; set; } = 1;
        public string UserSelectedLanguage { get; set; } = "he";
    }
}
